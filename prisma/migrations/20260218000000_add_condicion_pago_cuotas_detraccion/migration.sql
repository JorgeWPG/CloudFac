-- ============================================================
-- Migration: add_condicion_pago_cuotas_detraccion
-- Agrega soporte para:
--   1. Condición de pago (Contado/Crédito) en facturas
--   2. Modelo InvoiceCuota para cuotas a crédito
--   3. Campos de detracción SUNAT en facturas
-- ============================================================

-- Crear enum CondicionPago
CREATE TYPE "CondicionPago" AS ENUM ('CONTADO', 'CREDITO');

-- Agregar campos de condición de pago a Invoice
ALTER TABLE "Invoice"
  ADD COLUMN "condicionPago" "CondicionPago" NOT NULL DEFAULT 'CONTADO';

-- Agregar campos de detracción a Invoice
ALTER TABLE "Invoice"
  ADD COLUMN "habilitadoDetraccion"        BOOLEAN          NOT NULL DEFAULT false,
  ADD COLUMN "codigoDetraccion"             TEXT,
  ADD COLUMN "porcentajeDetraccion"         DECIMAL(5,2),
  ADD COLUMN "medioPagoDetraccion"          TEXT,
  ADD COLUMN "montoDetraccion"              DECIMAL(12,2),
  ADD COLUMN "numeroConstanciaDetraccion"   TEXT;

-- Crear tabla InvoiceCuota
CREATE TABLE "InvoiceCuota" (
    "id"           TEXT         NOT NULL,
    "tenantId"     TEXT         NOT NULL,
    "invoiceId"    TEXT         NOT NULL,
    "numeroCuota"  INTEGER      NOT NULL,
    "monto"        DECIMAL(12,2) NOT NULL,
    "fechaPago"    TIMESTAMP(3) NOT NULL,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvoiceCuota_pkey" PRIMARY KEY ("id")
);

-- Restricción única: una cuota por número dentro de cada factura
ALTER TABLE "InvoiceCuota"
  ADD CONSTRAINT "InvoiceCuota_invoiceId_numeroCuota_key"
  UNIQUE ("invoiceId", "numeroCuota");

-- Índices de rendimiento
CREATE INDEX "InvoiceCuota_tenantId_idx"  ON "InvoiceCuota"("tenantId");
CREATE INDEX "InvoiceCuota_invoiceId_idx" ON "InvoiceCuota"("invoiceId");

-- Foreign keys
ALTER TABLE "InvoiceCuota"
  ADD CONSTRAINT "InvoiceCuota_tenantId_fkey"
  FOREIGN KEY ("tenantId")  REFERENCES "Tenant"("id")  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "InvoiceCuota"
  ADD CONSTRAINT "InvoiceCuota_invoiceId_fkey"
  FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE  ON UPDATE CASCADE;
