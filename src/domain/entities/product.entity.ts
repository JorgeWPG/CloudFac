export interface Product {
  id: string;
  tenantId: string;
  companyId: string;
  codigo?: string;
  /** Código SUNAT catálogo 25 */
  codigoSunat?: string;
  descripcion: string;
  /** Unidad de medida SUNAT (NIU, ZZ, KGM, etc.) */
  unidadMedida: string;
  /** true = Servicio (sin inventario), false = Producto físico */
  isService: boolean;
  /** Activa control de stock. Solo válido cuando isService = false */
  stockControl: boolean;
  stock: number;
  stockMinimo: number;
  /** Precio unitario sin IGV */
  precio: number;
  /** Precio unitario con IGV incluido */
  precioConIgv: number;
  igvPorcentaje: number;
  /** Catálogo 07 SUNAT (10=Gravado, 20=Exonerado, 30=Inafecto) */
  afectacionIgv: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
