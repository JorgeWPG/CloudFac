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
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
