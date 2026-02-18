export enum InvoiceEstado {
  BORRADOR = "BORRADOR",
  EMITIDO = "EMITIDO",
  ANULADO = "ANULADO",
}

export const INVOICE_ESTADO_LABELS: Record<InvoiceEstado, string> = {
  [InvoiceEstado.BORRADOR]: "Borrador",
  [InvoiceEstado.EMITIDO]: "Emitido",
  [InvoiceEstado.ANULADO]: "Anulado",
};
