import axios from "axios";
import { NubefactService, NubefactRespuesta } from "@/application/services/nubefact.service";
import { Invoice } from "@/domain/entities/invoice.entity";
import { TIPO_COMPROBANTE_SUNAT_CODE } from "@/domain/value-objects/tipo-comprobante.vo";
import { NubefactError } from "@/domain/errors/domain.errors";
import { prisma } from "@/infrastructure/database/prisma/client";
import { getMonedaCodigo } from "@/lib/sunat-constants";

/**
 * Implementación del servicio NubeFact.
 * Serializa comprobantes al formato requerido por la API REST de NubeFact.
 * Incluye soporte para condición de pago (contado/crédito), cuotas y detracciones SUNAT.
 * Documentación: https://nubefact.com/documentacion
 */
export class NubefactServiceImpl implements NubefactService {
  private async getCredentials(companyId: string): Promise<{
    token: string;
    url: string;
  }> {
    const company = await prisma.company.findUniqueOrThrow({
      where: { id: companyId },
      select: { nubefactToken: true, nubefactUrl: true, ruc: true },
    });

    const token = company.nubefactToken ?? process.env.NUBEFACT_TOKEN;
    const url = company.nubefactUrl ?? process.env.NUBEFACT_API_URL;

    if (!token || !url) {
      throw new NubefactError(
        "Credenciales de NubeFact no configuradas para esta empresa."
      );
    }
    return { token, url };
  }

  async send(invoice: Invoice): Promise<NubefactRespuesta> {
    const { token, url } = await this.getCredentials(invoice.companyId);

    const payload = this.buildPayload(invoice);

    try {
      const response = await axios.post<NubefactRespuesta>(url, payload, {
        headers: {
          Authorization: `Token token="${token}"`,
          "Content-Type": "application/json",
        },
        timeout: 30_000,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new NubefactError(
          error.response.data?.errors ?? "Error al conectar con NubeFact.",
          String(error.response.status)
        );
      }
      throw new NubefactError("Error de red al conectar con NubeFact.");
    }
  }

  async sendBaja(
    companyId: string,
    tipoComprobante: string,
    serie: string,
    correlativo: string,
    motivo: string
  ): Promise<NubefactRespuesta> {
    const { token, url } = await this.getCredentials(companyId);

    const bajaUrl = url.replace("/api/v1", "/api/v1/bajas");

    try {
      const response = await axios.post<NubefactRespuesta>(
        bajaUrl,
        {
          tipo_de_comprobante: tipoComprobante,
          serie,
          correlativo,
          motivo,
        },
        {
          headers: {
            Authorization: `Token token="${token}"`,
            "Content-Type": "application/json",
          },
          timeout: 30_000,
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new NubefactError(
          error.response.data?.errors ?? "Error al solicitar baja en NubeFact.",
          String(error.response.status)
        );
      }
      throw new NubefactError("Error de red al conectar con NubeFact.");
    }
  }

  private buildPayload(invoice: Invoice): Record<string, unknown> {
    const tipoSunat = TIPO_COMPROBANTE_SUNAT_CODE[invoice.tipoComprobante];

    const payload: Record<string, unknown> = {
      operacion: "generar_comprobante",
      tipo_de_comprobante: parseInt(tipoSunat),
      serie: invoice.serie,
      numero: parseInt(invoice.correlativo),
      sunat_transaction: 1,
      cliente_tipo_de_documento: 6,
      cliente_numero_de_documento: "00000000000",
      cliente_denominacion: "CLIENTE GENÉRICO",
      fecha_de_emision: invoice.fechaEmision.toISOString().split("T")[0],
      moneda: getMonedaCodigo(invoice.moneda),
      tipo_de_cambio: invoice.tipoCambio,
      porcentaje_de_igv: 18,
      total_gravada: invoice.totalGravado,
      total_exonerada: invoice.totalExonerado,
      total_inafecta: invoice.totalInafecto,
      total_igv: invoice.totalIgv,
      total: invoice.totalVenta,
      enviar_automaticamente_a_la_sunat: true,
      enviar_automaticamente_al_cliente: false,

      // ── Condición de pago (1=Contado, 2=Crédito) ──────────
      condicion_de_pago: invoice.condicionPago,

      items: invoice.items?.map((item) => ({
        unidad_de_medida: item.unidadMedida,
        codigo: item.codigoSunat ?? "P001",
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        valor_unitario: item.precioUnitario,
        precio_unitario: item.precioConIgv,
        descuento: item.descuento,
        subtotal: item.totalBaseImponible,
        tipo_de_igv: parseInt(item.afectacionIgv),
        igv: item.totalIgv,
        total: item.totalItem,
        anticipo_regularizacion: false,
      })),
    };

    // ── Cuotas a crédito ──────────────────────────────────────
    if (invoice.condicionPago === 2 && invoice.cuotas && invoice.cuotas.length > 0) {
      payload["cuotas"] = invoice.cuotas.map((cuota) => ({
        numero_de_cuota: cuota.numeroCuota,
        monto: cuota.monto,
        fecha_de_pago: cuota.fechaPago.toISOString().split("T")[0],
      }));
    }

    // ── Detracciones SUNAT ────────────────────────────────────
    // Solo se incluyen si habilitadoDetraccion=true y el monto supera el umbral
    if (invoice.habilitadoDetraccion && invoice.codigoDetraccion) {
      payload["habilitado_detraccion"] = true;
      payload["codigo_detraccion"] = invoice.codigoDetraccion;
      payload["porcentaje_detraccion"] = invoice.porcentajeDetraccion;
      payload["monto_detraccion"] = invoice.montoDetraccion;

      if (invoice.medioPagoDetraccion) {
        payload["medio_de_pago_detraccion"] = invoice.medioPagoDetraccion;
      }
      if (invoice.numeroConstanciaDetraccion) {
        payload["numero_constancia_detraccion"] = invoice.numeroConstanciaDetraccion;
      }
    }

    return payload;
  }
}
