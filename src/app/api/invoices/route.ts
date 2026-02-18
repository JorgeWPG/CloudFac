import { NextRequest, NextResponse } from "next/server";
import { CreateInvoiceSchema } from "@/application/dtos/invoice.dto";
import { CreateInvoiceUseCase } from "@/application/use-cases/invoice/create-invoice.use-case";
import { PrismaInvoiceRepository } from "@/infrastructure/repositories/prisma-invoice.repository";
import { PrismaProductRepository } from "@/infrastructure/repositories/prisma-product.repository";
import { ValidationError } from "@/domain/errors/domain.errors";

/**
 * GET /api/invoices — Listar comprobantes del tenant
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // TODO: Obtener tenantId desde la sesión autenticada (NextAuth)
    const tenantId = req.headers.get("x-tenant-id");
    if (!tenantId) {
      return NextResponse.json({ error: "Tenant no identificado." }, { status: 401 });
    }

    const invoiceRepo = new PrismaInvoiceRepository();
    const result = await invoiceRepo.findAll(
      {
        tenantId,
        companyId: searchParams.get("companyId") ?? undefined,
        search: searchParams.get("q") ?? undefined,
      },
      {
        page: Number(searchParams.get("page") ?? 1),
        pageSize: Number(searchParams.get("pageSize") ?? 20),
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/invoices]", error);
    return NextResponse.json(
      { error: "Error al obtener comprobantes." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/invoices — Crear nuevo comprobante
 */
export async function POST(req: NextRequest) {
  try {
    // TODO: Obtener tenantId desde la sesión autenticada (NextAuth)
    const tenantId = req.headers.get("x-tenant-id");
    if (!tenantId) {
      return NextResponse.json({ error: "Tenant no identificado." }, { status: 401 });
    }

    const body = await req.json();
    const parsed = CreateInvoiceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const useCase = new CreateInvoiceUseCase({
      invoiceRepository: new PrismaInvoiceRepository(),
      productRepository: new PrismaProductRepository(),
    });

    const invoice = await useCase.execute({ tenantId, dto: parsed.data });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    console.error("[POST /api/invoices]", error);
    return NextResponse.json(
      { error: "Error al crear el comprobante." },
      { status: 500 }
    );
  }
}
