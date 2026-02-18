import { Invoice } from "@/domain/entities/invoice.entity";
import { InvoiceRepository } from "@/domain/repositories/invoice.repository";
import { InvoiceEstado } from "@/domain/value-objects/invoice-estado.vo";
import { SunatEstado } from "@/domain/value-objects/sunat-estado.vo";
import { NotFoundError, NubefactError } from "@/domain/errors/domain.errors";
import { NubefactService } from "@/application/services/nubefact.service";

interface SendToNubefactUseCaseParams {
  tenantId: string;
  invoiceId: string;
}

interface Dependencies {
  invoiceRepository: InvoiceRepository;
  nubefactService: NubefactService;
}

/**
 * Caso de uso: Enviar comprobante a SUNAT vía NubeFact.
 * Serializa el comprobante al formato requerido y actualiza el estado.
 */
export class SendToNubefactUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute({ tenantId, invoiceId }: SendToNubefactUseCaseParams): Promise<Invoice> {
    const { invoiceRepository, nubefactService } = this.deps;

    const invoice = await invoiceRepository.findById(invoiceId, tenantId);
    if (!invoice) throw new NotFoundError("Comprobante", invoiceId);

    if (invoice.nubefactEnviado) {
      throw new NubefactError(
        `El comprobante ${invoice.numeroCompleto} ya fue enviado a SUNAT.`
      );
    }

    // Delegar el envío al servicio de infraestructura
    const respuesta = await nubefactService.send(invoice);

    // Determinar el estado según la respuesta de NubeFact
    const sunatEstado = respuesta.errors
      ? SunatEstado.RECHAZADO
      : SunatEstado.ACEPTADO;

    const updatedInvoice = await invoiceRepository.updateSunatEstado(
      invoiceId,
      tenantId,
      sunatEstado,
      respuesta
    );

    await invoiceRepository.update(invoiceId, tenantId, {
      nubefactEnviado: true,
      estado: sunatEstado === SunatEstado.ACEPTADO
        ? InvoiceEstado.EMITIDO
        : InvoiceEstado.BORRADOR,
      nubefactPdfUrl: respuesta.enlace_del_pdf ?? undefined,
      nubefactXmlUrl: respuesta.enlace_del_xml ?? undefined,
      nubefactCdrUrl: respuesta.enlace_del_cdr ?? undefined,
      sunatDescripcion: respuesta.descripcion ?? undefined,
    });

    return updatedInvoice;
  }
}
