export enum MetodoPago {
  EFECTIVO = "EFECTIVO",
  TRANSFERENCIA = "TRANSFERENCIA",
  TARJETA_CREDITO = "TARJETA_CREDITO",
  TARJETA_DEBITO = "TARJETA_DEBITO",
  YAPE = "YAPE",
  PLIN = "PLIN",
  CHEQUE = "CHEQUE",
  DEPOSITO = "DEPOSITO",
  OTROS = "OTROS",
}

export const METODO_PAGO_LABELS: Record<MetodoPago, string> = {
  [MetodoPago.EFECTIVO]: "Efectivo",
  [MetodoPago.TRANSFERENCIA]: "Transferencia Bancaria",
  [MetodoPago.TARJETA_CREDITO]: "Tarjeta de Crédito",
  [MetodoPago.TARJETA_DEBITO]: "Tarjeta de Débito",
  [MetodoPago.YAPE]: "Yape",
  [MetodoPago.PLIN]: "Plin",
  [MetodoPago.CHEQUE]: "Cheque",
  [MetodoPago.DEPOSITO]: "Depósito Bancario",
  [MetodoPago.OTROS]: "Otros",
};
