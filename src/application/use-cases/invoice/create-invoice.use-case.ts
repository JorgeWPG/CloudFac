import { Invoice, InvoiceItem } from "@/domain/entities/invoice.entity";
import { InvoiceRepository } from "@/domain/repositories/invoice.repository";
import { ProductRepository } from "@/domain/repositories/product.repository";
import { InvoiceEstado } from "@/domain/value-objects/invoice-estado.vo";
import { SunatEstado } from "@/domain/value-objects/sunat-estado.vo";
import { StockInsuficienteError, NotFoundError } from "@/domain/errors/domain.errors";
import { CreateInvoiceDto } from "@/application/dtos/invoice.dto";
import { CATALOGO_DETRACCIONES_MAP } from "@/domain/value-objects/catalogo-detracciones.vo";

interface CreateInvoiceUseCaseParams {
  tenantId: string;
  dto: CreateInvoiceDto;
}

interface Dependencies {
  invoiceRepository: InvoiceRepository;
  productRepository: ProductRepository;
}

/**
 * Caso de uso: Crear comprobante electrónico.
 * Valida stock, calcula totales, genera número correlativo y persiste la factura.
 */
export class CreateInvoiceUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute({ tenantId, dto }: CreateInvoiceUseCaseParams): Promise<Invoice> {
    const { invoiceRepository, productRepository } = this.deps;

    // 1. Obtener correlativo siguiente
    const correlativo = await invoiceRepository.getNextCorrelativo(dto.serieId);
    const correlativoStr = String(correlativo).padStart(8, "0");

    // La serie se resuelve en infraestructura; aquí usamos la prop del dto
    // como placeholder hasta que el repositorio la complete
    const serie = ""; // Se resolverá al persistir (ver implementación del repo)

    // 2. Construir ítems con totales calculados
    const items: Omit<InvoiceItem, "id" | "invoiceId" | "createdAt" | "updatedAt">[] =
      await Promise.all(
        dto.items.map(async (item, index) => {
          // Validar stock si es producto físico con control de inventario
          if (item.productId) {
            const product = await productRepository.findById(item.productId, tenantId);
            if (!product) throw new NotFoundError("Producto", item.productId);

            if (product.stockControl && !product.isService) {
              if (product.stock < item.cantidad) {
                throw new StockInsuficienteError(
                  item.productId,
                  product.stock,
                  item.cantidad
                );
              }
            }
          }

          // Cálculos tributarios
          const baseImponible =
            (item.precioUnitario - item.descuento) * item.cantidad;
          const igv =
            item.afectacionIgv === "10"
              ? baseImponible * (item.igvPorcentaje / 100)
              : 0;
          const precioConIgv = item.precioUnitario * (1 + item.igvPorcentaje / 100);

          return {
            tenantId,
            productId: item.productId,
            orden: index + 1,
            descripcion: item.descripcion,
            unidadMedida: item.unidadMedida ?? "NIU",
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            precioConIgv,
            descuento: item.descuento,
            igvPorcentaje: item.igvPorcentaje,
            afectacionIgv: item.afectacionIgv,
            codigoSunat: item.codigoSunat,
            totalBaseImponible: Number(baseImponible.toFixed(2)),
            totalIgv: Number(igv.toFixed(2)),
            totalItem: Number((baseImponible + igv).toFixed(2)),
          };
        })
      );

    // 3. Calcular totales del comprobante
    const totalGravado = items
      .filter((i) => i.afectacionIgv === "10")
      .reduce((acc, i) => acc + i.totalBaseImponible, 0);
    const totalExonerado = items
      .filter((i) => i.afectacionIgv === "20")
      .reduce((acc, i) => acc + i.totalBaseImponible, 0);
    const totalInafecto = items
      .filter((i) => i.afectacionIgv === "30")
      .reduce((acc, i) => acc + i.totalBaseImponible, 0);
    const totalIgv = items.reduce((acc, i) => acc + i.totalIgv, 0);
    const totalVenta = items.reduce((acc, i) => acc + i.totalItem, 0);

    // 4. Calcular detracción si aplica
    // El porcentaje puede venir explícito en el DTO o inferirse del catálogo SUNAT (Catálogo 54)
    let montoDetraccion: number | undefined;
    let porcentajeDetraccion: number | undefined;

    if (dto.afectoDetraccion && dto.codigoDetraccion) {
      const catalogEntry = CATALOGO_DETRACCIONES_MAP[dto.codigoDetraccion];
      porcentajeDetraccion =
        dto.porcentajeDetraccion ?? catalogEntry?.porcentaje;

      if (porcentajeDetraccion !== undefined) {
        montoDetraccion = Number(
          (totalVenta * (porcentajeDetraccion / 100)).toFixed(2)
        );
      }
    }

    // 5. Crear la factura
    const invoice = await invoiceRepository.create({
      tenantId,
      companyId: dto.companyId,
      establishmentId: dto.establishmentId,
      serieId: dto.serieId,
      customerId: dto.customerId,
      tipoComprobante: dto.tipoComprobante,
      serie,
      correlativo: correlativoStr,
      numeroCompleto: `${serie}-${correlativoStr}`,
      fechaEmision: dto.fechaEmision ?? new Date(),
      fechaVencimiento: dto.fechaVencimiento,
      moneda: dto.moneda,
      tipoCambio: dto.tipoCambio,
      totalGravado: Number(totalGravado.toFixed(2)),
      totalExonerado: Number(totalExonerado.toFixed(2)),
      totalInafecto: Number(totalInafecto.toFixed(2)),
      totalGratuito: 0,
      totalIgv: Number(totalIgv.toFixed(2)),
      totalDescuento: 0,
      totalVenta: Number(totalVenta.toFixed(2)),
      // Detracción
      afectoDetraccion: dto.afectoDetraccion ?? false,
      codigoDetraccion: dto.afectoDetraccion ? dto.codigoDetraccion : undefined,
      porcentajeDetraccion: dto.afectoDetraccion ? porcentajeDetraccion : undefined,
      montoDetraccion: dto.afectoDetraccion ? montoDetraccion : undefined,
      medioPagoDetraccion: dto.afectoDetraccion ? dto.medioPagoDetraccion : undefined,
      nubefactEnviado: false,
      sunatEstado: SunatEstado.PENDIENTE,
      documentoRelacionado: dto.documentoRelacionado,
      motivoNota: dto.motivoNota,
      estado: InvoiceEstado.BORRADOR,
      notas: dto.notas,
    });

    return invoice;
  }
}
