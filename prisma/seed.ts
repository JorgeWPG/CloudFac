import { PrismaClient, TipoComprobante } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed de CloudFac...\n");

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
  console.log(`✔ Tenant:          ${tenant.name} (${tenant.id})`);

  // ── 2. Usuario admin ────────────────────────────────────────
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
  console.log(`✔ Usuario:         ${user.email} (${user.role})`);

  // ── 3. Empresa Demo SAC ─────────────────────────────────────
  const company = await prisma.company.upsert({
    where: {
      tenantId_ruc: { tenantId: tenant.id, ruc: "20123456789" },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      ruc: "20123456789",
      razonSocial: "EMPRESA DEMO SAC",
      nombreComercial: "Empresa Demo",
      direccion: "AV. DEMO 123, LIMA",
      ubigeo: "150101",
      departamento: "LIMA",
      provincia: "LIMA",
      distrito: "LIMA",
    },
  });
  console.log(`✔ Empresa:         ${company.razonSocial} (RUC: ${company.ruc})`);

  // ── 4. Establecimiento 0000 — Lima ──────────────────────────
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
      direccion: "AV. DEMO 123, LIMA",
      ubigeo: "150101",
      isDefault: true,
    },
  });
  console.log(
    `✔ Establecimiento: ${establishment.descripcion} (${establishment.codigoSunat}) — Lima`
  );

  // ── 5. Series: F001 (Factura) y B001 (Boleta) ───────────────
  const seriesData: Array<{ tipo: TipoComprobante; serie: string }> = [
    { tipo: "FACTURA", serie: "F001" },
    { tipo: "BOLETA", serie: "B001" },
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
    console.log(`✔ Serie:           ${s.serie} (${s.tipo})`);
  }

  // ── 6. Productos ─────────────────────────────────────────────
  // IGV 18 % — Afectación 10 (Gravado Op. Onerosa, catálogo 07 SUNAT)
  const productosData = [
    {
      codigo: "PROD-001",
      descripcion: "Laptop",
      unidadMedida: "NIU", // Unidad
      isService: false,
      stockControl: true,
      stock: 10,
      stockMinimo: 2,
      precio: 2500.0,          // Sin IGV
      precioConIgv: 2950.0,    // 2500 × 1.18
      igvPorcentaje: 18,
      afectacionIgv: "10",
    },
    {
      codigo: "PROD-002",
      descripcion: "Mouse",
      unidadMedida: "NIU",
      isService: false,
      stockControl: true,
      stock: 50,
      stockMinimo: 5,
      precio: 50.0,            // Sin IGV
      precioConIgv: 59.0,      // 50 × 1.18
      igvPorcentaje: 18,
      afectacionIgv: "10",
    },
    {
      codigo: "SERV-001",
      descripcion: "Consultoría TI",
      unidadMedida: "ZZ", // Servicio
      isService: true,
      stockControl: false,
      stock: 0,
      stockMinimo: 0,
      precio: 150.0,           // Sin IGV
      precioConIgv: 177.0,     // 150 × 1.18
      igvPorcentaje: 18,
      afectacionIgv: "10",
    },
  ];

  for (const prod of productosData) {
    const existing = await prisma.product.findFirst({
      where: { tenantId: tenant.id, companyId: company.id, codigo: prod.codigo },
    });

    if (!existing) {
      await prisma.product.create({
        data: { tenantId: tenant.id, companyId: company.id, ...prod },
      });
    }

    const tag = prod.isService ? "Servicio" : "Producto con stock";
    console.log(`✔ Producto:        ${prod.descripcion} (${tag}) — IGV ${prod.igvPorcentaje}% / Afect. ${prod.afectacionIgv}`);
  }

  console.log("\nSeed completado exitosamente.");
  console.log("─────────────────────────────────────────────");
  console.log(`Empresa:     EMPRESA DEMO SAC  |  RUC: 20123456789`);
  console.log(`Establecim.: 0000 Casa Matriz  |  Lima`);
  console.log(`Series:      F001 (Factura), B001 (Boleta)`);
  console.log(`Productos:   Laptop, Mouse (stock) | Consultoría TI (servicio)`);
  console.log("─────────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
