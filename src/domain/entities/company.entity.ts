export interface Company {
  id: string;
  tenantId: string;
  ruc: string;
  razonSocial: string;
  nombreComercial?: string;
  direccion?: string;
  ubigeo?: string;
  urbanizacion?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  telefono?: string;
  email?: string;
  web?: string;
  logoUrl?: string;
  nubefactToken?: string;
  nubefactUrl?: string;
  /** Número de cuenta en el Banco de la Nación para depósitos de detracciones */
  detraccionCuentaBn?: string;
  /** Tasa de IGV por defecto para nuevos productos/ítems (ej. 18) */
  tasaIgvDefecto: number;
  /** Usuario SOL SUNAT para integración SIRE */
  sunatUsuario?: string;
  /** Clave SOL SUNAT para integración SIRE */
  sunatClave?: string;
  /** Client ID OAuth2 para SIRE */
  sireClientId?: string;
  /** Client Secret OAuth2 para SIRE */
  sireClientSecret?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
