/**
 * Constantes SUNAT para el sistema de facturación electrónica CloudFac.
 *
 * Referencias:
 *  - Manual del Programador NubeFact
 *  - Resolución de Superintendencia N° 097-2012/SUNAT y modificatorias
 *  - Tablas de catálogos del Anexo II del Reglamento de Comprobantes de Pago
 */

// ─────────────────────────────────────────────────────────
// TABLA 1 — Medios de pago (para Detracciones)
// Referencia: Resolución de Superintendencia N° 183-2004/SUNAT
// ─────────────────────────────────────────────────────────
export const TABLA1_MEDIOS_PAGO = {
  "001": "Depósito en cuenta",
  "002": "Giro",
  "003": "Transferencia de fondos",
  "004": "Orden de pago",
  "005": "Tarjeta de débito",
} as const;

export type MedioPagoDetraccionCode = keyof typeof TABLA1_MEDIOS_PAGO;

export const TABLA1_OPTIONS = Object.entries(TABLA1_MEDIOS_PAGO).map(
  ([code, label]) => ({ code, label })
);

// ─────────────────────────────────────────────────────────
// TABLA 2 — Tipos de moneda (ISO 4217)
// ─────────────────────────────────────────────────────────
export const TABLA2_MONEDAS = {
  PEN: { codigo: 1, descripcion: "Soles" },
  USD: { codigo: 2, descripcion: "Dólares Americanos" },
  EUR: { codigo: 3, descripcion: "Euros" },
} as const;

export type MonedaCode = keyof typeof TABLA2_MONEDAS;

export const TABLA2_OPTIONS = Object.entries(TABLA2_MONEDAS).map(
  ([iso, { codigo, descripcion }]) => ({ iso, codigo, descripcion })
);

// Mapeo ISO → código NubeFact
export function getMonedaCodigo(iso: string): number {
  return TABLA2_MONEDAS[iso as MonedaCode]?.codigo ?? 1;
}

// ─────────────────────────────────────────────────────────
// TABLA 4 — Tipos de documento de identidad
// ─────────────────────────────────────────────────────────
export const TABLA4_TIPOS_DOCUMENTO = {
  "0": "Sin documento",
  "1": "DNI",
  "4": "Carnet de Extranjería",
  "6": "RUC",
  "7": "Pasaporte",
  "A": "Cédula Diplomática de Identidad",
  "B": "Doc. de Identidad - País de Residencia",
} as const;

export type TipoDocumentoCodigo = keyof typeof TABLA4_TIPOS_DOCUMENTO;

export const TABLA4_OPTIONS = Object.entries(TABLA4_TIPOS_DOCUMENTO).map(
  ([codigo, descripcion]) => ({ codigo, descripcion })
);

// ─────────────────────────────────────────────────────────
// TABLA 6 — Tipos de tributo
// ─────────────────────────────────────────────────────────
export const TABLA6_TRIBUTOS = {
  "1000": { nombre: "IGV", codigo: "VAT", categoria: "S" },
  "1016": { nombre: "IVAP", codigo: "VAT", categoria: "S" },
  "2000": { nombre: "ISC", codigo: "EXC", categoria: "S" },
  "7152": { nombre: "ICBPER", codigo: "OTH", categoria: "S" },
  "9995": { nombre: "EXPORTACIÓN", codigo: "FRE", categoria: "E" },
  "9996": { nombre: "GRATUITO", codigo: "FRE", categoria: "Z" },
  "9997": { nombre: "EXONERADO", codigo: "VAT", categoria: "E" },
  "9998": { nombre: "INAFECTO", codigo: "FRE", categoria: "O" },
} as const;

export type TributoCode = keyof typeof TABLA6_TRIBUTOS;

// ─────────────────────────────────────────────────────────
// TABLA 10 — Tipo de afectación del IGV (Catálogo N° 07)
// ─────────────────────────────────────────────────────────
export const TABLA10_AFECTACION_IGV = {
  "10": "Gravado - Operación Onerosa",
  "11": "Gravado - Retiro por premio",
  "12": "Gravado - Retiro por donación",
  "13": "Gravado - Retiro",
  "14": "Gravado - Retiro por publicidad",
  "15": "Gravado - Bonificaciones",
  "16": "Gravado - Retiro por entrega a trabajadores",
  "17": "Gravado - IVAP",
  "20": "Exonerado - Operación Onerosa",
  "21": "Exonerado - Transferencia gratuita",
  "30": "Inafecto - Operación Onerosa",
  "31": "Inafecto - Retiro por Bonificación",
  "32": "Inafecto - Retiro",
  "33": "Inafecto - Retiro por Muestras Médicas",
  "34": "Inafecto - Retiro por Convenio Colectivo",
  "35": "Inafecto - Retiro por premio",
  "36": "Inafecto - Retiro por publicidad",
  "40": "Exportación de Bienes o Servicios",
} as const;

export type AfectacionIgvCode = keyof typeof TABLA10_AFECTACION_IGV;

export const TABLA10_OPTIONS = Object.entries(TABLA10_AFECTACION_IGV).map(
  ([code, label]) => ({ code, label })
);

// ─────────────────────────────────────────────────────────
// CATÁLOGO 54 — Códigos de bienes y servicios sujetos a detracción
// Resolución de Superintendencia N° 183-2004/SUNAT y modificatorias
// ─────────────────────────────────────────────────────────
export const CATALOGO54_DETRACCION = {
  "001": { descripcion: "Azúcar y melaza de caña", porcentaje: 10 },
  "003": { descripcion: "Alcohol etílico", porcentaje: 10 },
  "004": { descripcion: "Recursos hidrobiológicos", porcentaje: 4 },
  "005": { descripcion: "Maíz amarillo duro", porcentaje: 4 },
  "006": { descripcion: "Arena y piedra", porcentaje: 10 },
  "007": { descripcion: "Residuos y subproductos no metálicos y metálicos", porcentaje: 15 },
  "008": { descripcion: "Madera", porcentaje: 4 },
  "009": { descripcion: "Arena para construcción", porcentaje: 10 },
  "010": { descripcion: "Aceite de pescado", porcentaje: 10 },
  "011": { descripcion: "Harina, polvo y pellets de pescado, crustáceos, etc.", porcentaje: 4 },
  "012": { descripcion: "Embarcaciones pesqueras", porcentaje: 9 },
  "016": { descripcion: "Aceite de pescado (venta)", porcentaje: 9 },
  "019": { descripcion: "Minerales no metálicos", porcentaje: 12 },
  "020": { descripcion: "Bienes de los CIIU 3512, 3522, 3523, 3592", porcentaje: 15 },
  "021": { descripcion: "Oro y demás minerales metálicos exonerados", porcentaje: 12 },
  "022": { descripcion: "Paprika y otros frutos de los géneros Capsicum", porcentaje: 10 },
  "023": { descripcion: "Espárragos", porcentaje: 10 },
  "024": { descripcion: "Minerales metálicos no auríferos", porcentaje: 10 },
  "025": { descripcion: "Bienes gravados con IGV o ISC por rentas de cuarta categoría", porcentaje: 9 },
  "026": { descripcion: "Plomo", porcentaje: 15 },
  "030": { descripcion: "Contratos de construcción", porcentaje: 4 },
  "031": { descripcion: "Oro gravado con IGV", porcentaje: 12 },
  "034": { descripcion: "Caña de azúcar", porcentaje: 10 },
  "035": { descripcion: "Cacao", porcentaje: 10 },
  "036": { descripcion: "Café", porcentaje: 10 },
  "037": { descripcion: "Aceite de palma", porcentaje: 10 },
  "039": { descripcion: "Minerales no metálicos (otro)", porcentaje: 12 },
  "040": { descripcion: "Bien inmueble gravado con IGV", porcentaje: 4 },
  "041": { descripcion: "Demás servicios gravados con IGV", porcentaje: 12 },
} as const;

export type CodigoDetraccionCode = keyof typeof CATALOGO54_DETRACCION;

export const CATALOGO54_OPTIONS = Object.entries(CATALOGO54_DETRACCION).map(
  ([code, { descripcion, porcentaje }]) => ({ code, descripcion, porcentaje })
);

// ─────────────────────────────────────────────────────────
// CONDICIÓN DE PAGO
// Según Manual NubeFact
// ─────────────────────────────────────────────────────────
export const CONDICION_PAGO = {
  CONTADO: 1,
  CREDITO: 2,
} as const;

export type CondicionPago = typeof CONDICION_PAGO[keyof typeof CONDICION_PAGO];

export const CONDICION_PAGO_LABEL: Record<CondicionPago, string> = {
  1: "Contado",
  2: "Crédito",
};

// ─────────────────────────────────────────────────────────
// DETRACCIÓN — Umbrales
// R.S. N° 183-2004/SUNAT: detracción aplica si el importe >= S/ 700
// ─────────────────────────────────────────────────────────
export const DETRACCION_MONTO_MINIMO = 700; // Soles

/**
 * Determina si una factura está sujeta a detracción.
 * @param totalVenta  Total de la factura en soles
 * @param codigoDetraccion  Código del catálogo 54 SUNAT (opcional)
 */
export function esSujetoDetraccion(
  totalVenta: number,
  codigoDetraccion?: string
): boolean {
  if (!codigoDetraccion) return false;
  return totalVenta >= DETRACCION_MONTO_MINIMO;
}

/**
 * Devuelve el porcentaje de detracción para un código dado.
 */
export function getPorcentajeDetraccion(
  codigoDetraccion: string
): number | undefined {
  return CATALOGO54_DETRACCION[codigoDetraccion as CodigoDetraccionCode]
    ?.porcentaje;
}

/**
 * Calcula el monto de detracción.
 */
export function calcularMontoDetraccion(
  totalVenta: number,
  porcentaje: number
): number {
  return Number(((totalVenta * porcentaje) / 100).toFixed(2));
}

// ─────────────────────────────────────────────────────────
// CATÁLOGO UNIDADES DE MEDIDA (SUNAT)
// ─────────────────────────────────────────────────────────
export const UNIDADES_MEDIDA = {
  NIU: "Unidad (bienes)",
  ZZ: "Servicio / Unidad de servicio",
  KGM: "Kilogramo",
  GRM: "Gramo",
  TNE: "Tonelada métrica",
  LTR: "Litro",
  MLT: "Mililitro",
  MTR: "Metro",
  CMT: "Centímetro",
  MTK: "Metro cuadrado",
  MTQ: "Metro cúbico",
  BX: "Caja",
  BO: "Bolsa",
  PK: "Paquete",
  ST: "Juego",
  SET: "Set",
  PR: "Par",
  DZN: "Docena",
  HUR: "Hora",
  DAY: "Día",
  MON: "Mes",
  ANN: "Año",
} as const;

export const UNIDADES_MEDIDA_OPTIONS = Object.entries(UNIDADES_MEDIDA).map(
  ([code, label]) => ({ code, label: `${code} — ${label}` })
);
