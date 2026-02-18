import { Payment } from "@/domain/entities/payment.entity";

export interface PaymentRepository {
  findById(id: string, tenantId: string): Promise<Payment | null>;
  findByInvoice(invoiceId: string, tenantId: string): Promise<Payment[]>;
  create(data: Omit<Payment, "id" | "createdAt" | "updatedAt">): Promise<Payment>;
  update(id: string, tenantId: string, data: Partial<Payment>): Promise<Payment>;
  /** Actualiza la URL y key S3 del voucher de pago */
  updateVoucher(
    id: string,
    tenantId: string,
    voucherUrl: string,
    voucherS3Key: string
  ): Promise<Payment>;
  delete(id: string, tenantId: string): Promise<void>;
}
