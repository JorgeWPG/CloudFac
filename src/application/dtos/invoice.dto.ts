import { z } from "zod";
import { TipoComprobante } from "@/domain/value-objects/tipo-comprobante.vo";
import { MetodoPago } from "@/domain/value-objects/metodo-pago.vo";
import { CATALOGO_DETRACCIONES_MAP } from "@/domain/value-objects/catalogo-detracciones.vo";
import { MedioPagoDetraccion } from "@/domain/value-objects/tabla1-medio-pago-detraccion.vo";

// ── Línea de detalle ────────────────────────────────────────

/** Tasas IGV permitidas por SUNAT: 18% (general), 10% (beneficio), 0% (exonerado/inafecto) */
const TASAS_IGV_VALIDAS = [0, 10, 18] as const;

export const InvoiceItemInputSchema = z.object({
  productId: z.string().cuid().optional(),
  descripcion: z.string().min(1, "Descripción requerida"),
  unidadMedida: z.string().default("NIU"),
  cantidad: z.number().positive("La cantidad debe ser mayor a 0"),
  precioUnitario: z.number().nonnegative(),
  descuento: z.number().nonnegative().default(0),
  /** Tasa de IGV. Valores permitidos: 18 (general), 10 (beneficio), 0 (exento) */
  igvPorcentaje: z
    .number()
    .refine(
      (v) => (TASAS_IGV_VALIDAS as readonly number[]).includes(v),
      `La tasa de IGV debe ser ${TASAS_IGV_VALIDAS.join("%, ")}%`
    )
    .default(18),
  /** Catálogo 07 SUNAT: "10"=Gravado, "20"=Exonerado, "30"=Inafecto */
  afectacionIgv: z
    .enum(["10", "20", "30"], {
      errorMap: () => ({
        message: 'Tipo de afectación IGV inválido. Use "10" (Gravado), "20" (Exonerado) o "30" (Inafecto)',
      }),
    })
    .default("10"),
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
  // Detracción SPOT
  afectoDetraccion: z.boolean().default(false),
  /** Código Catálogo 54 SUNAT (ej: "022", "027"). Requerido si afectoDetraccion=true */
  codigoDetraccion: z
    .string()
    .refine(
      (v) => v === undefined || v in CATALOGO_DETRACCIONES_MAP,
      "Código de detracción no válido según Catálogo 54 SUNAT"
    )
    .optional(),
  /** Porcentaje manual; si se omite, se toma del catálogo según codigoDetraccion */
  porcentajeDetraccion: z.number().nonnegative().max(100).optional(),
  /** Medio de pago TABLA 1 SUNAT. Requerido si afectoDetraccion=true */
  medioPagoDetraccion: z
    .nativeEnum(MedioPagoDetraccion)
    .optional(),
}).superRefine((data, ctx) => {
  if (data.afectoDetraccion) {
    if (!data.codigoDetraccion) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["codigoDetraccion"],
        message: "El código de detracción es obligatorio cuando afectoDetraccion=true",
      });
    }
    if (!data.medioPagoDetraccion) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["medioPagoDetraccion"],
        message: "El medio de pago (TABLA 1) es obligatorio cuando afectoDetraccion=true",
      });
    }
  }
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
