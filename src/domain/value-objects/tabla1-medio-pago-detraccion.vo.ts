/**
 * TABLA 1 de SUNAT — Medios de Pago para el Sistema de Detracciones (SPOT).
 * Obligatorio en el JSON de NubeFact cuando la factura tiene detracción activa.
 * Fuente: Resolución de Superintendencia N.° 183-2004/SUNAT y modificatorias.
 */

export enum MedioPagoDetraccion {
  DEPOSITO_EN_CUENTA = "001",
  GIRO               = "002",
  TRANSFERENCIA      = "003",
  ORDEN_DE_PAGO      = "004",
  TARJETA_DE_DEBITO  = "005",
}

export const MEDIO_PAGO_DETRACCION_LABELS: Record<MedioPagoDetraccion, string> = {
  [MedioPagoDetraccion.DEPOSITO_EN_CUENTA]: "Depósito en cuenta",
  [MedioPagoDetraccion.GIRO]:               "Giro",
  [MedioPagoDetraccion.TRANSFERENCIA]:      "Transferencia de fondos",
  [MedioPagoDetraccion.ORDEN_DE_PAGO]:      "Orden de pago",
  [MedioPagoDetraccion.TARJETA_DE_DEBITO]:  "Tarjeta de débito",
};

/** Array ordenado para renderizar en UI */
export const MEDIOS_PAGO_DETRACCION = Object.values(MedioPagoDetraccion).map(
  (code) => ({ codigo: code, descripcion: MEDIO_PAGO_DETRACCION_LABELS[code] })
);
