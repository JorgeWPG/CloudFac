export interface Establishment {
  id: string;
  tenantId: string;
  companyId: string;
  /** Código de 4 dígitos asignado por SUNAT. "0000" = casa matriz */
  codigoSunat: string;
  descripcion?: string;
  direccion?: string;
  ubigeo?: string;
  telefono?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
