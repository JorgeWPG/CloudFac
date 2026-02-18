import { z } from "zod";
import { TipoComprobante } from "@/domain/value-objects/tipo-comprobante.vo";
import { MetodoPago } from "@/domain/value-objects/metodo-pago.vo";

// ── Línea de detalle ────────────────────────────────────────

export const InvoiceItemInputSchema = z.object({
  productId: z.string().cuid().optional(),
  descripcion: z.string().min(1, "Descripción requerida"),
  unidadMedida: z.string().default("NIU"),
  cantidad: z.number().positive("La cantidad debe ser mayor a 0"),
  precioUnitario: z.number().nonnegative(),
  descuento: z.number().nonnegative().default(0),
  igvPorcentaje: z.number().nonnegative().default(18),
  afectacionIgv: z.string().default("10"),
  codigoSunat: z.string().optional(),
});

export type InvoiceItemInput = z.infer<typeof InvoiceItemInputSchema>;

// ── Creación de comprobante ────────────────────────────────

export const CreateInvoiceSchema = z.object({
  companyId: z.string().cuid(),
  establishmentId: z.string().cuid().optional(),
  serieId: z.string().cuid(),
  customerId: z.string().cuid(),
  tipoComprobante: z.nativeEnum(TipoComprobante),
  fechaEmision: z.coerce.date().optional(),
  fechaVencimiento: z.coerce.date().optional(),
  moneda: z.string().length(3).default("PEN"),
  tipoCambio: z.number().positive().default(1),
  documentoRelacionado: z.string().optional(),
  motivoNota: z.string().optional(),
  notas: z.string().optional(),
  items: z.array(InvoiceItemInputSchema).min(1, "Debe incluir al menos un ítem"),
});

export type CreateInvoiceDto = z.infer<typeof CreateInvoiceSchema>;

// ── Pago asociado al comprobante ───────────────────────────

export const CreatePaymentSchema = z.object({
  invoiceId: z.string().cuid(),
  metodoPago: z.nativeEnum(MetodoPago),
  monto: z.number().positive(),
  moneda: z.string().length(3).default("PEN"),
  tipoCambio: z.number().positive().default(1),
  fechaPago: z.coerce.date().optional(),
  referencia: z.string().optional(),
  notas: z.string().optional(),
});

export type CreatePaymentDto = z.infer<typeof CreatePaymentSchema>;
