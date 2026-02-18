import { prisma } from "@/infrastructure/database/prisma/client";
import {
  InvoiceRepository,
  InvoiceFilters,
  PaginationOptions,
  PaginatedResult,
  CuotaCreateInput,
} from "@/domain/repositories/invoice.repository";
import { Invoice } from "@/domain/entities/invoice.entity";
import { SunatEstado } from "@/domain/value-objects/sunat-estado.vo";
import { Prisma } from "@prisma/client";

export class PrismaInvoiceRepository implements InvoiceRepository {
  async findById(id: string, tenantId: string): Promise<Invoice | null> {
    const record = await prisma.invoice.findFirst({
      where: { id, tenantId },
      include: { items: true, cuotas: { orderBy: { numeroCuota: "asc" } } },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findByNumeroCompleto(
    companyId: string,
    numeroCompleto: string
  ): Promise<Invoice | null> {
    const record = await prisma.invoice.findFirst({
      where: { companyId, numeroCompleto },
      include: { cuotas: { orderBy: { numeroCuota: "asc" } } },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findAll(
    filters: InvoiceFilters,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<Invoice>> {
    const where: Prisma.InvoiceWhereInput = {
      tenantId: filters.tenantId,
      ...(filters.companyId && { companyId: filters.companyId }),
      ...(filters.customerId && { customerId: filters.customerId }),
      ...(filters.estado && { estado: filters.estado }),
      ...(filters.sunatEstado && { sunatEstado: filters.sunatEstado }),
      ...(filters.tipoComprobante && {
        tipoComprobante: filters.tipoComprobante,
      }),
      ...(filters.fechaDesde || filters.fechaHasta
        ? {
            fechaEmision: {
              ...(filters.fechaDesde && { gte: filters.fechaDesde }),
              ...(filters.fechaHasta && { lte: filters.fechaHasta }),
            },
          }
        : {}),
      ...(filters.search && {
        OR: [
          { numeroCompleto: { contains: filters.search, mode: "insensitive" } },
          {
            customer: {
              razonSocial: { contains: filters.search, mode: "insensitive" },
            },
          },
        ],
      }),
    };

    const [records, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
        orderBy: { fechaEmision: "desc" },
        include: { customer: true },
      }),
      prisma.invoice.count({ where }),
    ]);

    return {
      data: records.map((r) => this.toDomain(r)),
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize),
    };
  }

  async create(
    data: Omit<Invoice, "id" | "createdAt" | "updatedAt" | "items" | "cuotas">,
    cuotas?: CuotaCreateInput[]
  ): Promise<Invoice> {
    const serieRecord = await prisma.serie.findUnique({
      where: { id: data.serieId },
    });

    const serieStr = serieRecord?.serieAlfanumerica ?? data.serie;
    const numeroCompleto = `${serieStr}-${data.correlativo}`;

    // Convert CondicionPago numeric (1|2) to Prisma enum string
    const condicionPagoEnum = data.condicionPago === 2 ? "CREDITO" : "CONTADO";

    const record = await prisma.$transaction(async (tx) => {
      await tx.serie.update({
        where: { id: data.serieId },
        data: { correlativo: { increment: 1 } },
      });

      return tx.invoice.create({
        data: {
          tenantId: data.tenantId,
          companyId: data.companyId,
          establishmentId: data.establishmentId,
          serieId: data.serieId,
          customerId: data.customerId,
          tipoComprobante: data.tipoComprobante,
          serie: serieStr,
          correlativo: data.correlativo,
          numeroCompleto,
          fechaEmision: data.fechaEmision,
          fechaVencimiento: data.fechaVencimiento,
          moneda: data.moneda,
          tipoCambio: data.tipoCambio,
          totalGravado: data.totalGravado,
          totalExonerado: data.totalExonerado,
          totalInafecto: data.totalInafecto,
          totalGratuito: data.totalGratuito,
          totalIgv: data.totalIgv,
          totalDescuento: data.totalDescuento,
          totalVenta: data.totalVenta,
          // Condición de pago
          condicionPago: condicionPagoEnum,
          // Detracciones
          habilitadoDetraccion: data.habilitadoDetraccion,
          codigoDetraccion: data.codigoDetraccion,
          porcentajeDetraccion: data.porcentajeDetraccion,
          medioPagoDetraccion: data.medioPagoDetraccion,
          montoDetraccion: data.montoDetraccion,
          numeroConstanciaDetraccion: data.numeroConstanciaDetraccion,
          // NubeFact
          nubefactEnviado: data.nubefactEnviado,
          sunatEstado: data.sunatEstado,
          documentoRelacionado: data.documentoRelacionado,
          motivoNota: data.motivoNota,
          estado: data.estado,
          notas: data.notas,
          // Cuotas a crédito
          ...(cuotas && cuotas.length > 0
            ? {
                cuotas: {
                  createMany: {
                    data: cuotas.map((c) => ({
                      tenantId: data.tenantId,
                      numeroCuota: c.numeroCuota,
                      monto: c.monto,
                      fechaPago: c.fechaPago,
                    })),
                  },
                },
              }
            : {}),
        },
        include: {
          items: true,
          cuotas: { orderBy: { numeroCuota: "asc" } },
        },
      });
    });

    return this.toDomain(record);
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<Invoice>
  ): Promise<Invoice> {
    const record = await prisma.invoice.update({
      where: { id },
      data: {
        ...(data.estado !== undefined && { estado: data.estado }),
        ...(data.nubefactEnviado !== undefined && {
          nubefactEnviado: data.nubefactEnviado,
        }),
        ...(data.nubefactPdfUrl !== undefined && {
          nubefactPdfUrl: data.nubefactPdfUrl,
        }),
        ...(data.nubefactXmlUrl !== undefined && {
          nubefactXmlUrl: data.nubefactXmlUrl,
        }),
        ...(data.nubefactCdrUrl !== undefined && {
          nubefactCdrUrl: data.nubefactCdrUrl,
        }),
        ...(data.nubefactHash !== undefined && {
          nubefactHash: data.nubefactHash,
        }),
        ...(data.sunatDescripcion !== undefined && {
          sunatDescripcion: data.sunatDescripcion,
        }),
        ...(data.numeroConstanciaDetraccion !== undefined && {
          numeroConstanciaDetraccion: data.numeroConstanciaDetraccion,
        }),
        ...(data.notas !== undefined && { notas: data.notas }),
      },
      include: {
        items: true,
        cuotas: { orderBy: { numeroCuota: "asc" } },
      },
    });
    return this.toDomain(record);
  }

  async updateSunatEstado(
    id: string,
    tenantId: string,
    sunatEstado: SunatEstado,
    nubefactRespuesta?: Record<string, unknown>
  ): Promise<Invoice> {
    const record = await prisma.invoice.update({
      where: { id },
      data: {
        sunatEstado,
        ...(nubefactRespuesta && { nubefactRespuesta }),
      },
      include: {
        items: true,
        cuotas: { orderBy: { numeroCuota: "asc" } },
      },
    });
    return this.toDomain(record);
  }

  async getNextCorrelativo(serieId: string): Promise<number> {
    const serie = await prisma.serie.findUniqueOrThrow({
      where: { id: serieId },
      select: { correlativo: true },
    });
    return serie.correlativo + 1;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomain(record: any): Invoice {
    // Map Prisma CondicionPago enum → numeric 1|2
    const condicionPago = record.condicionPago === "CREDITO" ? 2 : 1;

    return {
      ...record,
      condicionPago,
      totalGravado: Number(record.totalGravado),
      totalExonerado: Number(record.totalExonerado),
      totalInafecto: Number(record.totalInafecto),
      totalGratuito: Number(record.totalGratuito),
      totalIgv: Number(record.totalIgv),
      totalDescuento: Number(record.totalDescuento),
      totalVenta: Number(record.totalVenta),
      tipoCambio: Number(record.tipoCambio),
      porcentajeDetraccion: record.porcentajeDetraccion != null
        ? Number(record.porcentajeDetraccion)
        : undefined,
      montoDetraccion: record.montoDetraccion != null
        ? Number(record.montoDetraccion)
        : undefined,
      items: record.items?.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item: any) => ({
          ...item,
          cantidad: Number(item.cantidad),
          precioUnitario: Number(item.precioUnitario),
          precioConIgv: Number(item.precioConIgv),
          descuento: Number(item.descuento),
          igvPorcentaje: Number(item.igvPorcentaje),
          totalBaseImponible: Number(item.totalBaseImponible),
          totalIgv: Number(item.totalIgv),
          totalItem: Number(item.totalItem),
        })
      ),
      cuotas: record.cuotas?.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (cuota: any) => ({
          ...cuota,
          monto: Number(cuota.monto),
        })
      ),
    };
  }
}
