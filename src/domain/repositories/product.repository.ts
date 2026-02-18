import { Product } from "@/domain/entities/product.entity";

export interface ProductRepository {
  findById(id: string, tenantId: string): Promise<Product | null>;
  findAll(tenantId: string, companyId: string): Promise<Product[]>;
  create(data: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product>;
  update(id: string, tenantId: string, data: Partial<Product>): Promise<Product>;
  updateStock(id: string, tenantId: string, delta: number): Promise<Product>;
  softDelete(id: string, tenantId: string): Promise<void>;
}
