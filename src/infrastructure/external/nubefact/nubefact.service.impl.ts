import axios from "axios";
import { NubefactService, NubefactRespuesta } from "@/application/services/nubefact.service";
import { Invoice } from "@/domain/entities/invoice.entity";
import { TIPO_COMPROBANTE_SUNAT_CODE } from "@/domain/value-objects/tipo-comprobante.vo";
import { NubefactError } from "@/domain/errors/domain.errors";
import { prisma } from "@/infrastructure/database/prisma/client";

/**
 * Implementación del servicio NubeFact.
 * Serializa comprobantes al formato requerido por la API REST de NubeFact.
 * Documentación: https://nubefact.com/documentacion
 */
export class NubefactServiceImpl implements NubefactService {
  private async getCredentials(companyId: string): Promise<{
    token: string;
    url: string;
    detraccionCuentaBn?: string;
  }> {
    const company = await prisma.company.findUniqueOrThrow({
      where: { id: companyId },
      select: {
        nubefactToken: true,
        nubefactUrl: true,
        ruc: true,
        detraccionCuentaBn: true,
      },
    });

    const token = company.nubefactToken ?? process.env.NUBEFACT_TOKEN;
    const url = company.nubefactUrl ?? process.env.NUBEFACT_API_URL;

    if (!token || !url) {
      throw new NubefactError(
        "Credenciales de NubeFact no configuradas para esta empresa."
      );
    }
    return {
      token,
      url,
      detraccionCuentaBn: company.detraccionCuentaBn ?? undefined,
    };
  }

  async send(invoice: Invoice): Promise<NubefactRespuesta> {
    const { token, url, detraccionCuentaBn } = await this.getCredentials(invoice.companyId);

    const payload = this.buildPayload(invoice, detraccionCuentaBn);

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

  private buildPayload(
    invoice: Invoice,
    detraccionCuentaBn?: string
  ): Record<string, unknown> {
    const tipoSunat =
      TIPO_COMPROBANTE_SUNAT_CODE[invoice.tipoComprobante];

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
      moneda: invoice.moneda === "PEN" ? 1 : 2,
      tipo_de_cambio: invoice.tipoCambio,
      porcentaje_de_igv: 18,
      total_gravada: invoice.totalGravado,
      total_exonerada: invoice.totalExonerado,
      total_inafecta: invoice.totalInafecto,
      total_igv: invoice.totalIgv,
      total: invoice.totalVenta,
      enviar_automaticamente_a_la_sunat: true,
      enviar_automaticamente_al_cliente: false,
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

    // Detracción SPOT — solo se incluye si la factura tiene detracción activa
    if (
      invoice.afectoDetraccion &&
      invoice.codigoDetraccion &&
      invoice.porcentajeDetraccion !== undefined &&
      invoice.montoDetraccion !== undefined &&
      invoice.medioPagoDetraccion
    ) {
      payload["datos_del_detraccion"] = {
        codigo_de_bien_o_servicio: invoice.codigoDetraccion,
        porcentaje: invoice.porcentajeDetraccion,
        monto: invoice.montoDetraccion,
        codigo_de_medio_de_pago: invoice.medioPagoDetraccion,
        // La cuenta BN proviene de la configuración de empresa (obligatoria para NubeFact)
        ...(detraccionCuentaBn && { numero_cuenta: detraccionCuentaBn }),
      };
    }

    return payload;
  }
}
