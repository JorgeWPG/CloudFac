export enum SunatEstado {
  PENDIENTE = "PENDIENTE",
  ACEPTADO = "ACEPTADO",
  RECHAZADO = "RECHAZADO",
  OBSERVADO = "OBSERVADO",
  ANULADO = "ANULADO",
  BAJA_PENDIENTE = "BAJA_PENDIENTE",
  DE_BAJA = "DE_BAJA",
}

export const SUNAT_ESTADO_LABELS: Record<SunatEstado, string> = {
  [SunatEstado.PENDIENTE]: "Pendiente",
  [SunatEstado.ACEPTADO]: "Aceptado",
  [SunatEstado.RECHAZADO]: "Rechazado",
  [SunatEstado.OBSERVADO]: "Observado",
  [SunatEstado.ANULADO]: "Anulado",
  [SunatEstado.BAJA_PENDIENTE]: "Baja Pendiente",
  [SunatEstado.DE_BAJA]: "De Baja",
};
