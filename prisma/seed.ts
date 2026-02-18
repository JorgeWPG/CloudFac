import { PrismaClient, TipoComprobante } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed de CloudFac...");

  // ── 1. Tenant demo ─────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      name: "Demo SaaS",
      slug: "demo",
      plan: "STARTER",
    },
  });
  console.log(`Tenant creado: ${tenant.name} (${tenant.id})`);

  // ── 2. Usuario admin ───────────────────────────────────────
  const user = await prisma.user.upsert({
    where: { email: "admin@cloudfac.pe" },
    update: {},
    create: {
      tenantId: tenant.id,
      name: "Administrador Demo",
      email: "admin@cloudfac.pe",
      role: "OWNER",
    },
  });
  console.log(`Usuario creado: ${user.email}`);

  // ── 3. Empresa demo ────────────────────────────────────────
  const company = await prisma.company.upsert({
    where: { tenantId_ruc: { tenantId: tenant.id, ruc: "20100070970" } },
    update: {},
    create: {
      tenantId: tenant.id,
      ruc: "20100070970",
      razonSocial: "EMPRESA DEMO S.A.C.",
      nombreComercial: "Demo Empresa",
      direccion: "AV. EJEMPLO 123",
      ubigeo: "150101",
      departamento: "LIMA",
      provincia: "LIMA",
      distrito: "LIMA",
    },
  });
  console.log(`Empresa creada: ${company.razonSocial} (RUC: ${company.ruc})`);

  // ── 4. Establecimiento principal ────────────────────────────
  const establishment = await prisma.establishment.upsert({
    where: {
      companyId_codigoSunat: {
        companyId: company.id,
        codigoSunat: "0000",
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      companyId: company.id,
      codigoSunat: "0000",
      descripcion: "Casa Matriz",
      direccion: "AV. EJEMPLO 123",
      ubigeo: "150101",
      isDefault: true,
    },
  });
  console.log(`Establecimiento: ${establishment.descripcion} (${establishment.codigoSunat})`);

  // ── 5. Series ──────────────────────────────────────────────
  const seriesData: Array<{
    tipo: TipoComprobante;
    serie: string;
  }> = [
    { tipo: "FACTURA", serie: "F001" },
    { tipo: "BOLETA", serie: "B001" },
    { tipo: "NOTA_CREDITO", serie: "FC01" },
    { tipo: "NOTA_DEBITO", serie: "FD01" },
  ];

  for (const s of seriesData) {
    await prisma.serie.upsert({
      where: {
        companyId_tipoComprobante_serieAlfanumerica: {
          companyId: company.id,
          tipoComprobante: s.tipo,
          serieAlfanumerica: s.serie,
        },
      },
      update: {},
      create: {
        tenantId: tenant.id,
        companyId: company.id,
        establishmentId: establishment.id,
        tipoComprobante: s.tipo,
        serieAlfanumerica: s.serie,
        correlativo: 0,
      },
    });
    console.log(`Serie creada: ${s.serie} (${s.tipo})`);
  }

  // ── 6. Cliente demo ────────────────────────────────────────
  await prisma.customer.upsert({
    where: {
      companyId_tipoDocumento_numeroDocumento: {
        companyId: company.id,
        tipoDocumento: "RUC",
        numeroDocumento: "20521234567",
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      companyId: company.id,
      tipoDocumento: "RUC",
      numeroDocumento: "20521234567",
      razonSocial: "CLIENTE DEMO S.A.C.",
      direccion: "AV. CLIENTE 456, LIMA",
      email: "cliente@demo.com",
    },
  });
  console.log("Cliente demo creado.");

  // ── 7. Productos demo ──────────────────────────────────────
  const productos = [
    {
      codigo: "PROD-001",
      descripcion: "Laptop Dell Inspiron 15",
      unidadMedida: "NIU",
      isService: false,
      stockControl: true,
      stock: 10,
      stockMinimo: 2,
      precio: 2500.0,
      precioConIgv: 2950.0,
    },
    {
      codigo: "SERV-001",
      descripcion: "Consultoría en Sistemas",
      unidadMedida: "ZZ",
      isService: true,
      stockControl: false,
      stock: 0,
      stockMinimo: 0,
      precio: 150.0,
      precioConIgv: 177.0,
    },
  ];

  for (const prod of productos) {
    const existing = await prisma.product.findFirst({
      where: { tenantId: tenant.id, companyId: company.id, codigo: prod.codigo },
    });
    if (!existing) {
      await prisma.product.create({
        data: {
          tenantId: tenant.id,
          companyId: company.id,
          ...prod,
          igvPorcentaje: 18,
          afectacionIgv: "10",
        },
      });
      console.log(`Producto creado: ${prod.descripcion}`);
    }
  }

  console.log("\nSeed completado exitosamente.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
