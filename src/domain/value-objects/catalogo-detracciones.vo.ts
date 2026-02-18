/**
 * Catálogo 54 de SUNAT — Bienes y servicios sujetos al SPOT (Sistema de Pago de Obligaciones Tributarias).
 * Fuente: SUNAT Tabla 54 - Códigos de bienes y servicios afectos a detracción.
 */

export interface DeduccionEntry {
  codigo: string;
  descripcion: string;
  porcentaje: number; // Porcentaje de detracción vigente
}

export const CATALOGO_DETRACCIONES: DeduccionEntry[] = [
  { codigo: "001", descripcion: "Azúcar y melaza de caña", porcentaje: 10 },
  { codigo: "003", descripcion: "Alcohol etílico", porcentaje: 10 },
  { codigo: "004", descripcion: "Recursos hidrobiológicos", porcentaje: 4 },
  { codigo: "005", descripcion: "Maíz amarillo duro", porcentaje: 4 },
  { codigo: "006", descripcion: "Algodón", porcentaje: 10 },
  { codigo: "007", descripcion: "Caña de azúcar", porcentaje: 10 },
  { codigo: "008", descripcion: "Madera", porcentaje: 4 },
  { codigo: "009", descripcion: "Arena y piedra", porcentaje: 10 },
  { codigo: "010", descripcion: "Residuos, subproductos, desechos, recortes y desperdicios", porcentaje: 15 },
  { codigo: "011", descripcion: "Bienes del inciso A) del Apéndice I de la Ley del IGV", porcentaje: 10 },
  { codigo: "012", descripcion: "Intermediación laboral y tercerización", porcentaje: 12 },
  { codigo: "014", descripcion: "Carnes y despojos comestibles", porcentaje: 4 },
  { codigo: "015", descripcion: "Aceite de pescado", porcentaje: 10 },
  { codigo: "016", descripcion: "Harina, polvo y pellets de pescado, crustáceos, moluscos y demás invertebrados acuáticos", porcentaje: 4 },
  { codigo: "017", descripcion: "Embarcaciones pesqueras", porcentaje: 9 },
  { codigo: "018", descripcion: "Remolque o empuje de embarcaciones y artefactos navales", porcentaje: 12 },
  { codigo: "019", descripcion: "Arrendamiento de bienes", porcentaje: 10 },
  { codigo: "020", descripcion: "Mantenimiento y reparación de bienes muebles", porcentaje: 12 },
  { codigo: "021", descripcion: "Movimiento de carga", porcentaje: 12 },
  { codigo: "022", descripcion: "Otros servicios empresariales", porcentaje: 12 },
  { codigo: "023", descripcion: "Leche", porcentaje: 4 },
  { codigo: "024", descripcion: "Comisión mercantil", porcentaje: 12 },
  { codigo: "025", descripcion: "Fabricación de bienes por encargo", porcentaje: 12 },
  { codigo: "026", descripcion: "Servicio de transporte de personas", porcentaje: 10 },
  { codigo: "027", descripcion: "Servicios de transporte de carga", porcentaje: 4 },
  { codigo: "030", descripcion: "Contratos de construcción", porcentaje: 4 },
  { codigo: "031", descripcion: "Oro gravado con el IGV", porcentaje: 10 },
  { codigo: "032", descripcion: "Paprika y otros frutos de los géneros capsicum o pimienta", porcentaje: 10 },
  { codigo: "033", descripcion: "Espárragos", porcentaje: 10 },
  { codigo: "034", descripcion: "Minerales metálicos no auríferos", porcentaje: 10 },
  { codigo: "035", descripcion: "Bienes exonerados del IGV", porcentaje: 1.5 },
  { codigo: "036", descripcion: "Oro y demás minerales metálicos exonerados del IGV", porcentaje: 1.5 },
  { codigo: "037", descripcion: "Demás servicios gravados con el IGV", porcentaje: 12 },
  { codigo: "039", descripcion: "Minerales no metálicos", porcentaje: 10 },
  { codigo: "040", descripcion: "Bien inmueble gravado con IGV", porcentaje: 4 },
];

/** Mapa rápido: código → entrada del catálogo */
export const CATALOGO_DETRACCIONES_MAP: Record<string, DeduccionEntry> =
  Object.fromEntries(CATALOGO_DETRACCIONES.map((d) => [d.codigo, d]));
