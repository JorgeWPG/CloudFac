import { MetodoPago } from "@/domain/value-objects/metodo-pago.vo";
import { PaymentEstado } from "@/domain/value-objects/payment-estado.vo";

export interface Payment {
  id: string;
  tenantId: string;
  invoiceId: string;
  metodoPago: MetodoPago;
  monto: number;
  moneda: string;
  tipoCambio: number;
  fechaPago: Date;
  referencia?: string;
  /** URL pública o pre-signed del voucher almacenado en AWS S3 */
  voucherUrl?: string;
  /** Object key en el bucket S3 para gestionar el archivo */
  voucherS3Key?: string;
  notas?: string;
  estado: PaymentEstado;
  createdAt: Date;
  updatedAt: Date;
}
