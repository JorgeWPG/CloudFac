-- ============================================================
-- Migration: add_detraccion_and_company_config
-- Adds detraction (SPOT), SIRE credentials, and global IGV
-- rate configuration to Company; detraction fields to Invoice.
-- ============================================================

-- Company: Banco de la Nación account for detracciones
ALTER TABLE "Company" ADD COLUMN "detraccionCuentaBn" TEXT;

-- Company: default IGV rate (global setting)
ALTER TABLE "Company" ADD COLUMN "tasaIgvDefecto" DECIMAL(5,2) NOT NULL DEFAULT 18;

-- Company: SIRE (Sistema Integrado de Registros Electrónicos) credentials
ALTER TABLE "Company" ADD COLUMN "sunatUsuario"     TEXT;
ALTER TABLE "Company" ADD COLUMN "sunatClave"       TEXT;
ALTER TABLE "Company" ADD COLUMN "sireClientId"     TEXT;
ALTER TABLE "Company" ADD COLUMN "sireClientSecret" TEXT;

-- Invoice: SPOT detraction fields
ALTER TABLE "Invoice" ADD COLUMN "afectoDetraccion"     BOOLEAN      NOT NULL DEFAULT false;
ALTER TABLE "Invoice" ADD COLUMN "codigoDetraccion"     TEXT;
ALTER TABLE "Invoice" ADD COLUMN "porcentajeDetraccion" DECIMAL(5,2);
ALTER TABLE "Invoice" ADD COLUMN "montoDetraccion"      DECIMAL(12,2);
ALTER TABLE "Invoice" ADD COLUMN "medioPagoDetraccion"  TEXT;
