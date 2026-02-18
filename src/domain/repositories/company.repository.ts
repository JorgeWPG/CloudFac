import { Company } from "@/domain/entities/company.entity";

export interface CompanyRepository {
  findById(id: string, tenantId: string): Promise<Company | null>;
  findByRuc(ruc: string, tenantId: string): Promise<Company | null>;
  findAllByTenant(tenantId: string): Promise<Company[]>;
  create(data: Omit<Company, "id" | "createdAt" | "updatedAt">): Promise<Company>;
  update(id: string, tenantId: string, data: Partial<Company>): Promise<Company>;
  softDelete(id: string, tenantId: string): Promise<void>;
}
