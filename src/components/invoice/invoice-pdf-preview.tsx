"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import { CONDICION_PAGO_LABEL } from "@/lib/sunat-constants";

interface PreviewItem {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuento?: number;
  igvPorcentaje?: number;
  afectacionIgv?: string;
  unidadMedida?: string;
}

interface PreviewCuota {
  numeroCuota: number;
  monto: number;
  fechaPago: string;
}

export interface InvoicePreviewData {
  // Emisor
  razonSocialEmisor?: string;
  rucEmisor?: string;
  direccionEmisor?: string;
  // Receptor
  razonSocialReceptor?: string;
  rucReceptor?: string;
  // Comprobante
  tipoComprobante?: string;
  serie?: string;
  correlativo?: string;
  fechaEmision?: string;
  moneda?: string;
  condicionPago?: 1 | 2;
  // Detracción
  habilitadoDetraccion?: boolean;
  codigoDetraccion?: string;
  porcentajeDetraccion?: number;
  montoDetraccion?: number;
  // Ítems
  items?: PreviewItem[];
  // Cuotas
  cuotas?: PreviewCuota[];
  // Totales
  totalGravado?: number;
  totalIgv?: number;
  totalVenta?: number;
}

interface InvoicePdfPreviewProps {
  data: InvoicePreviewData;
  className?: string;
}

/**
 * Componente de preview de factura en tiempo real.
 * Se actualiza a medida que el usuario llena el formulario.
 * No genera un PDF real — muestra un layout HTML que se asemeja al comprobante.
 */
export function InvoicePdfPreview({ data, className }: InvoicePdfPreviewProps) {
  const currency = data.moneda ?? "PEN";
  const fmt = (n: number) => formatCurrency(n, currency);

  // Calcular totales localmente desde los ítems si no se proporcionan
  const items = data.items ?? [];
  const calcTotals = () => {
    let gravado = 0;
    let igv = 0;
    let total = 0;
    for (const item of items) {
      const base = (item.precioUnitario - (item.descuento ?? 0)) * item.cantidad;
      const igvItem =
        (item.afectacionIgv ?? "10") === "10"
          ? base * ((item.igvPorcentaje ?? 18) / 100)
          : 0;
      gravado += base;
      igv += igvItem;
      total += base + igvItem;
    }
    return { gravado, igv, total };
  };

  const totals = calcTotals();
  const totalGravado = data.totalGravado ?? totals.gravado;
  const totalIgv = data.totalIgv ?? totals.igv;
  const totalVenta = data.totalVenta ?? totals.total;

  const condicionLabel = data.condicionPago
    ? CONDICION_PAGO_LABEL[data.condicionPago]
    : "Contado";

  const tipoLabel: Record<string, string> = {
    FACTURA: "FACTURA ELECTRÓNICA",
    BOLETA: "BOLETA DE VENTA ELECTRÓNICA",
    NOTA_CREDITO: "NOTA DE CRÉDITO ELECTRÓNICA",
    NOTA_DEBITO: "NOTA DE DÉBITO ELECTRÓNICA",
  };

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm text-xs font-mono ${className ?? ""}`}
      style={{ minWidth: 380 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-start gap-4">
          {/* Emisor */}
          <div className="flex-1">
            <p className="font-bold text-sm text-gray-900">
              {data.razonSocialEmisor ?? "— Razón Social —"}
            </p>
            <p className="text-gray-600">RUC: {data.rucEmisor ?? "—"}</p>
            {data.direccionEmisor && (
              <p className="text-gray-500 text-[10px] leading-tight mt-0.5">
                {data.direccionEmisor}
              </p>
            )}
          </div>

          {/* Número de comprobante */}
          <div className="border border-gray-300 rounded p-2 text-center min-w-[140px]">
            <p className="font-bold text-[10px] text-gray-700 uppercase">
              {tipoLabel[data.tipoComprobante ?? ""] ?? data.tipoComprobante ?? "COMPROBANTE"}
            </p>
            <p className="font-bold text-base text-indigo-700 mt-1">
              {data.serie ?? "F001"}-
              {data.correlativo
                ? data.correlativo.padStart(8, "0")
                : "00000001"}
            </p>
          </div>
        </div>
      </div>

      {/* Datos del receptor */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <span className="text-gray-500">Cliente: </span>
            <span className="font-medium">
              {data.razonSocialReceptor ?? "—"}
            </span>
          </div>
          <div>
            <span className="text-gray-500">RUC/DNI: </span>
            <span className="font-medium">{data.rucReceptor ?? "—"}</span>
          </div>
          <div>
            <span className="text-gray-500">Fecha: </span>
            <span className="font-medium">
              {data.fechaEmision
                ? formatDate(new Date(data.fechaEmision))
                : formatDate(new Date())}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Moneda: </span>
            <span className="font-medium">{currency}</span>
          </div>
          <div>
            <span className="text-gray-500">Condición: </span>
            <span
              className={`font-medium ${data.condicionPago === 2 ? "text-amber-600" : "text-green-600"}`}
            >
              {condicionLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Ítems */}
      <div className="p-4">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 uppercase">
              <th className="text-left py-1 pr-2">Descripción</th>
              <th className="text-right py-1 pr-2">Cant.</th>
              <th className="text-right py-1 pr-2">P.Unit.</th>
              <th className="text-right py-1">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-3 text-center text-gray-400 italic">
                  Sin ítems
                </td>
              </tr>
            ) : (
              items.map((item, i) => {
                const base =
                  (item.precioUnitario - (item.descuento ?? 0)) * item.cantidad;
                const subtotal =
                  (item.afectacionIgv ?? "10") === "10"
                    ? base * (1 + (item.igvPorcentaje ?? 18) / 100)
                    : base;
                return (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-1 pr-2 text-gray-800">{item.descripcion}</td>
                    <td className="py-1 pr-2 text-right text-gray-700">
                      {item.cantidad}
                      <span className="text-gray-400 ml-0.5">{item.unidadMedida ?? "NIU"}</span>
                    </td>
                    <td className="py-1 pr-2 text-right text-gray-700">
                      {fmt(item.precioUnitario)}
                    </td>
                    <td className="py-1 text-right font-medium text-gray-800">
                      {fmt(subtotal)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Cuotas (solo si Crédito) */}
      {data.condicionPago === 2 && data.cuotas && data.cuotas.length > 0 && (
        <div className="px-4 pb-3">
          <p className="text-[10px] font-semibold text-gray-600 mb-1 uppercase tracking-wide">
            Cuotas de pago
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded text-[10px]">
            {data.cuotas.map((cuota) => (
              <div
                key={cuota.numeroCuota}
                className="flex justify-between px-2 py-1 border-b border-amber-100 last:border-0"
              >
                <span className="text-gray-600">
                  Cuota {cuota.numeroCuota} — Vence:{" "}
                  {cuota.fechaPago
                    ? formatDate(new Date(cuota.fechaPago))
                    : "—"}
                </span>
                <span className="font-semibold text-amber-700">
                  {fmt(cuota.monto)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detracción */}
      {data.habilitadoDetraccion && data.codigoDetraccion && (
        <div className="px-4 pb-3">
          <div className="bg-blue-50 border border-blue-200 rounded p-2 text-[10px]">
            <p className="font-semibold text-blue-700 mb-1">Sujeto a Detracción</p>
            <div className="flex justify-between">
              <span className="text-gray-600">
                Código {data.codigoDetraccion} — {data.porcentajeDetraccion}%
              </span>
              <span className="font-semibold text-blue-700">
                {data.montoDetraccion ? fmt(data.montoDetraccion) : "—"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Totales */}
      <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-lg">
        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between text-gray-600">
            <span>Op. Gravadas</span>
            <span>{fmt(totalGravado)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>IGV (18%)</span>
            <span>{fmt(totalIgv)}</span>
          </div>
          {data.habilitadoDetraccion && data.montoDetraccion && (
            <div className="flex justify-between text-blue-600">
              <span>Detracción</span>
              <span>- {fmt(data.montoDetraccion)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-sm text-gray-900 border-t border-gray-300 pt-1 mt-1">
            <span>TOTAL</span>
            <span className="text-indigo-700">{fmt(totalVenta)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
