export enum PaymentEstado {
  PENDIENTE = "PENDIENTE",
  COMPLETADO = "COMPLETADO",
  RECHAZADO = "RECHAZADO",
  REEMBOLSADO = "REEMBOLSADO",
}

export const PAYMENT_ESTADO_LABELS: Record<PaymentEstado, string> = {
  [PaymentEstado.PENDIENTE]: "Pendiente",
  [PaymentEstado.COMPLETADO]: "Completado",
  [PaymentEstado.RECHAZADO]: "Rechazado",
  [PaymentEstado.REEMBOLSADO]: "Reembolsado",
};
