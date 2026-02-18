import { z } from "zod";

export const CreateCompanySchema = z.object({
  ruc: z
    .string()
    .length(11, "El RUC debe tener 11 dígitos")
    .regex(/^\d+$/, "El RUC solo debe contener dígitos"),
  razonSocial: z.string().min(2, "Razón Social requerida"),
  nombreComercial: z.string().optional(),
  direccion: z.string().optional(),
  ubigeo: z.string().length(6).optional(),
  urbanizacion: z.string().optional(),
  departamento: z.string().optional(),
  provincia: z.string().optional(),
  distrito: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email().optional(),
  web: z.string().url().optional(),
  nubefactToken: z.string().optional(),
  nubefactUrl: z.string().url().optional(),
  // Detracción
  detraccionCuentaBn: z
    .string()
    .max(20, "Máximo 20 caracteres")
    .optional()
    .or(z.literal("")),
  // IGV global
  tasaIgvDefecto: z
    .number()
    .nonnegative("La tasa IGV no puede ser negativa")
    .max(100)
    .default(18),
  // Credenciales SIRE
  sunatUsuario: z.string().optional(),
  sunatClave: z.string().optional(),
  sireClientId: z.string().optional(),
  sireClientSecret: z.string().optional(),
});

export type CreateCompanyDto = z.infer<typeof CreateCompanySchema>;

export const UpdateCompanySchema = CreateCompanySchema.partial().omit({
  ruc: true,
});

export type UpdateCompanyDto = z.infer<typeof UpdateCompanySchema>;

export const CreateEstablishmentSchema = z.object({
  companyId: z.string().cuid(),
  codigoSunat: z
    .string()
    .length(4, "El código SUNAT debe tener 4 dígitos")
    .regex(/^\d{4}$/, "Solo dígitos permitidos"),
  descripcion: z.string().optional(),
  direccion: z.string().optional(),
  ubigeo: z.string().length(6).optional(),
  telefono: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export type CreateEstablishmentDto = z.infer<typeof CreateEstablishmentSchema>;

export const CreateSerieSchema = z.object({
  companyId: z.string().cuid(),
  establishmentId: z.string().cuid().optional(),
  tipoComprobante: z.enum([
    "FACTURA",
    "BOLETA",
    "NOTA_CREDITO",
    "NOTA_DEBITO",
    "RECIBO",
  ]),
  serieAlfanumerica: z
    .string()
    .min(2)
    .max(4)
    .regex(/^[A-Z0-9]+$/, "Solo letras mayúsculas y números"),
});

export type CreateSerieDto = z.infer<typeof CreateSerieSchema>;
