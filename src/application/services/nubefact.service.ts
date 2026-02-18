import { Invoice } from "@/domain/entities/invoice.entity";

export interface NubefactRespuesta {
  aceptada_por_sunat?: boolean;
  codigo?: string;
  descripcion?: string;
  errors?: string;
  enlace_del_pdf?: string;
  enlace_del_xml?: string;
  enlace_del_cdr?: string;
  sunat_description?: string;
  sunat_note?: string;
  [key: string]: unknown;
}

/**
 * Contrato del servicio de integración con NubeFact.
 * La implementación concreta vive en la capa de infraestructura.
 */
export interface NubefactService {
  /**
   * Envía un comprobante a SUNAT vía NubeFact y retorna la respuesta.
   */
  send(invoice: Invoice): Promise<NubefactRespuesta>;

  /**
   * Solicita la baja (anulación) de un comprobante ante SUNAT.
   */
  sendBaja(
    companyId: string,
    tipoComprobante: string,
    serie: string,
    correlativo: string,
    motivo: string
  ): Promise<NubefactRespuesta>;
}
