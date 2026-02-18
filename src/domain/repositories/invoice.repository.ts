import { Invoice } from "@/domain/entities/invoice.entity";
import { InvoiceEstado } from "@/domain/value-objects/invoice-estado.vo";
import { SunatEstado } from "@/domain/value-objects/sunat-estado.vo";
import { TipoComprobante } from "@/domain/value-objects/tipo-comprobante.vo";

export interface InvoiceFilters {
  tenantId: string;
  companyId?: string;
  customerId?: string;
  estado?: InvoiceEstado;
  sunatEstado?: SunatEstado;
  tipoComprobante?: TipoComprobante;
  fechaDesde?: Date;
  fechaHasta?: Date;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CuotaCreateInput {
  numeroCuota: number;
  monto: number;
  fechaPago: Date;
}

export interface InvoiceRepository {
  findById(id: string, tenantId: string): Promise<Invoice | null>;
  findByNumeroCompleto(
    companyId: string,
    numeroCompleto: string
  ): Promise<Invoice | null>;
  findAll(
    filters: InvoiceFilters,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<Invoice>>;
  create(
    data: Omit<Invoice, "id" | "createdAt" | "updatedAt" | "items" | "cuotas">,
    cuotas?: CuotaCreateInput[]
  ): Promise<Invoice>;
  update(id: string, tenantId: string, data: Partial<Invoice>): Promise<Invoice>;
  updateSunatEstado(
    id: string,
    tenantId: string,
    sunatEstado: SunatEstado,
    nubefactRespuesta?: Record<string, unknown>
  ): Promise<Invoice>;
  getNextCorrelativo(serieId: string): Promise<number>;
}
