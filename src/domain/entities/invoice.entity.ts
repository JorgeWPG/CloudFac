import { TipoComprobante } from "@/domain/value-objects/tipo-comprobante.vo";
import { SunatEstado } from "@/domain/value-objects/sunat-estado.vo";
import { InvoiceEstado } from "@/domain/value-objects/invoice-estado.vo";

export interface InvoiceItem {
  id: string;
  tenantId: string;
  invoiceId: string;
  productId?: string;
  orden: number;
  descripcion: string;
  unidadMedida: string;
  cantidad: number;
  precioUnitario: number;
  precioConIgv: number;
  descuento: number;
  igvPorcentaje: number;
  afectacionIgv: string;
  codigoSunat?: string;
  totalBaseImponible: number;
  totalIgv: number;
  totalItem: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Cuota de pago a crédito.
 * La suma de todos los montos debe coincidir con el totalVenta del comprobante.
 */
export interface InvoiceCuota {
  id: string;
  tenantId: string;
  invoiceId: string;
  numeroCuota: number;
  monto: number;
  fechaPago: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  tenantId: string;
  companyId: string;
  establishmentId?: string;
  serieId: string;
  customerId: string;

  tipoComprobante: TipoComprobante;
  serie: string;
  correlativo: string;
  /** Número completo formateado (ej: F001-00001234) */
  numeroCompleto: string;

  fechaEmision: Date;
  fechaVencimiento?: Date;

  moneda: string;
  tipoCambio: number;

  totalGravado: number;
  totalExonerado: number;
  totalInafecto: number;
  totalGratuito: number;
  totalIgv: number;
  totalDescuento: number;
  totalVenta: number;

  // Condición de pago (Manual NubeFact)
  /** 1=Contado, 2=Crédito */
  condicionPago: 1 | 2;

  // Detracciones SUNAT
  /** Indica si el comprobante tiene detracción habilitada */
  habilitadoDetraccion: boolean;
  /** Código del bien/servicio sujeto a detracción (Catálogo 54 SUNAT) */
  codigoDetraccion?: string;
  /** Porcentaje de detracción según Catálogo 54 */
  porcentajeDetraccion?: number;
  /** Medio de pago de la detracción (Tabla 1 SUNAT) */
  medioPagoDetraccion?: string;
  /** Monto calculado de detracción */
  montoDetraccion?: number;
  /** Número de constancia de detracción */
  numeroConstanciaDetraccion?: string;

  // NubeFact
  nubefactEnviado: boolean;
  nubefactRespuesta?: Record<string, unknown>;
  nubefactCdrUrl?: string;
  nubefactPdfUrl?: string;
  nubefactXmlUrl?: string;
  nubefactHash?: string;
  sunatEstado: SunatEstado;
  sunatDescripcion?: string;

  // Notas de crédito / débito
  documentoRelacionado?: string;
  motivoNota?: string;

  estado: InvoiceEstado;
  notas?: string;

  items?: InvoiceItem[];
  cuotas?: InvoiceCuota[];

  createdAt: Date;
  updatedAt: Date;
}
