import { z } from "zod";
import { TipoComprobante } from "@/domain/value-objects/tipo-comprobante.vo";
import { MetodoPago } from "@/domain/value-objects/metodo-pago.vo";
import { DETRACCION_MONTO_MINIMO } from "@/lib/sunat-constants";

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

// ── Cuota de crédito ────────────────────────────────────────

export const InvoiceCuotaInputSchema = z.object({
  numeroCuota: z.number().int().positive("El número de cuota debe ser positivo"),
  monto: z.number().positive("El monto de cuota debe ser mayor a 0"),
  fechaPago: z.coerce.date({ required_error: "La fecha de pago de la cuota es requerida" }),
});

export type InvoiceCuotaInput = z.infer<typeof InvoiceCuotaInputSchema>;

// ── Creación de comprobante ────────────────────────────────

export const CreateInvoiceSchema = z
  .object({
    companyId: z.string().cuid(),
    establishmentId: z.string().cuid().optional(),
    serieId: z.string().cuid(),
    customerId: z.string().cuid(),
    tipoComprobante: z.nativeEnum(TipoComprobante),
    fechaEmision: z.coerce.date().optional(),
    fechaVencimiento: z.coerce.date().optional(),
    moneda: z.string().length(3).default("PEN"),
    tipoCambio: z.number().positive().default(1),

    // Condición de pago (Manual NubeFact): 1=Contado, 2=Crédito
    condicionPago: z.union([z.literal(1), z.literal(2)]).default(1),

    // Cuotas — requeridas solo si condicionPago = 2 (Crédito)
    cuotas: z.array(InvoiceCuotaInputSchema).optional(),

    // Detracciones SUNAT (opcionales)
    habilitadoDetraccion: z.boolean().default(false),
    codigoDetraccion: z.string().optional(),
    porcentajeDetraccion: z.number().nonnegative().optional(),
    medioPagoDetraccion: z.string().optional(),

    // Notas de crédito / débito
    documentoRelacionado: z.string().optional(),
    motivoNota: z.string().optional(),

    notas: z.string().optional(),
    items: z.array(InvoiceItemInputSchema).min(1, "Debe incluir al menos un ítem"),
  })
  .superRefine((data, ctx) => {
    // ── Validación de cuotas ───────────────────────────────────
    if (data.condicionPago === 2) {
      if (!data.cuotas || data.cuotas.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cuotas"],
          message:
            "Debe especificar al menos una cuota cuando la condición de pago es Crédito.",
        });
        return;
      }

      // Verificar números de cuota únicos y consecutivos
      const numeros = data.cuotas.map((c) => c.numeroCuota).sort((a, b) => a - b);
      const tieneRepetidos = new Set(numeros).size !== numeros.length;
      if (tieneRepetidos) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cuotas"],
          message: "Los números de cuota deben ser únicos.",
        });
      }
    }

    // ── Validación de detracción ───────────────────────────────
    if (data.habilitadoDetraccion) {
      if (!data.codigoDetraccion) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["codigoDetraccion"],
          message: "Debe especificar el código de detracción (Catálogo 54 SUNAT).",
        });
      }
      if (!data.medioPagoDetraccion) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["medioPagoDetraccion"],
          message: "Debe especificar el medio de pago de la detracción (Tabla 1 SUNAT).",
        });
      }
    }
  });

export type CreateInvoiceDto = z.infer<typeof CreateInvoiceSchema>;

/**
 * Valida que la suma de cuotas sea igual al total de la factura.
 * Se llama desde el use case después de calcular los totales.
 */
export function validarSumaCuotas(
  cuotas: InvoiceCuotaInput[],
  totalVenta: number
): void {
  const sumaCuotas = cuotas.reduce((acc, c) => acc + c.monto, 0);
  const diferencia = Math.abs(sumaCuotas - totalVenta);

  // Tolerancia de S/ 0.10 por redondeo
  if (diferencia > 0.10) {
    throw new Error(
      `La suma de las cuotas (${sumaCuotas.toFixed(2)}) no coincide con el total de la factura (${totalVenta.toFixed(2)}).`
    );
  }
}

/**
 * Determina si se debe habilitar la detracción automáticamente
 * según el monto total y el código de bien/servicio.
 */
export function debeHabilitarDetraccion(
  totalVenta: number,
  codigoDetraccion?: string
): boolean {
  if (!codigoDetraccion) return false;
  return totalVenta >= DETRACCION_MONTO_MINIMO;
}

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
