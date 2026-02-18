/** Catálogo de tipos de comprobante SUNAT */
export enum TipoComprobante {
  FACTURA = "FACTURA",           // Código SUNAT: 01
  BOLETA = "BOLETA",             // Código SUNAT: 03
  NOTA_CREDITO = "NOTA_CREDITO", // Código SUNAT: 07
  NOTA_DEBITO = "NOTA_DEBITO",   // Código SUNAT: 08
  RECIBO = "RECIBO",             // Código SUNAT: 99
}

export const TIPO_COMPROBANTE_SUNAT_CODE: Record<TipoComprobante, string> = {
  [TipoComprobante.FACTURA]: "01",
  [TipoComprobante.BOLETA]: "03",
  [TipoComprobante.NOTA_CREDITO]: "07",
  [TipoComprobante.NOTA_DEBITO]: "08",
  [TipoComprobante.RECIBO]: "99",
};

export const TIPO_COMPROBANTE_LABELS: Record<TipoComprobante, string> = {
  [TipoComprobante.FACTURA]: "Factura Electrónica",
  [TipoComprobante.BOLETA]: "Boleta de Venta Electrónica",
  [TipoComprobante.NOTA_CREDITO]: "Nota de Crédito Electrónica",
  [TipoComprobante.NOTA_DEBITO]: "Nota de Débito Electrónica",
  [TipoComprobante.RECIBO]: "Recibo por Honorarios Electrónico",
};
