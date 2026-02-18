import { prisma } from "@/infrastructure/database/prisma/client";
import { ProductRepository } from "@/domain/repositories/product.repository";
import { Product } from "@/domain/entities/product.entity";

export class PrismaProductRepository implements ProductRepository {
  async findById(id: string, tenantId: string): Promise<Product | null> {
    const record = await prisma.product.findFirst({
      where: { id, tenantId },
    });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findAll(tenantId: string, companyId: string): Promise<Product[]> {
    const records = await prisma.product.findMany({
      where: { tenantId, companyId, isActive: true },
      orderBy: { descripcion: "asc" },
    });
    return records.map(this.toDomain);
  }

  async create(
    data: Omit<Product, "id" | "createdAt" | "updatedAt">
  ): Promise<Product> {
    const record = await prisma.product.create({
      data: {
        tenantId: data.tenantId,
        companyId: data.companyId,
        codigo: data.codigo,
        codigoSunat: data.codigoSunat,
        descripcion: data.descripcion,
        unidadMedida: data.unidadMedida,
        isService: data.isService,
        stockControl: data.stockControl,
        stock: data.stock,
        stockMinimo: data.stockMinimo,
        precio: data.precio,
        precioConIgv: data.precioConIgv,
        igvPorcentaje: data.igvPorcentaje,
        afectacionIgv: data.afectacionIgv,
      },
    });
    return this.toDomain(record);
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<Product>
  ): Promise<Product> {
    const record = await prisma.product.update({
      where: { id },
      data: {
        ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
        ...(data.precio !== undefined && { precio: data.precio }),
        ...(data.precioConIgv !== undefined && { precioConIgv: data.precioConIgv }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.stockMinimo !== undefined && { stockMinimo: data.stockMinimo }),
      },
    });
    return this.toDomain(record);
  }

  async updateStock(id: string, tenantId: string, delta: number): Promise<Product> {
    const record = await prisma.product.update({
      where: { id },
      data: { stock: { increment: delta } },
    });
    return this.toDomain(record);
  }

  async softDelete(id: string, tenantId: string): Promise<void> {
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomain(record: any): Product {
    return {
      ...record,
      stock: Number(record.stock),
      stockMinimo: Number(record.stockMinimo),
      precio: Number(record.precio),
      precioConIgv: Number(record.precioConIgv),
      igvPorcentaje: Number(record.igvPorcentaje),
    };
  }
}
