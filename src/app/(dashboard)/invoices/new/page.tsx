"use client";

import { useState, useCallback } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as Switch from "@radix-ui/react-switch";
import { Plus, Trash2, Sparkles, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import {
  CATALOGO54_OPTIONS,
  TABLA1_OPTIONS,
  CONDICION_PAGO_LABEL,
  DETRACCION_MONTO_MINIMO,
  getPorcentajeDetraccion,
  calcularMontoDetraccion,
} from "@/lib/sunat-constants";
import {
  InvoicePdfPreview,
  type InvoicePreviewData,
} from "@/components/invoice/invoice-pdf-preview";

// ─── Tipos locales del formulario ───────────────────────────

interface ItemForm {
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  igvPorcentaje: number;
  afectacionIgv: string;
  unidadMedida: string;
  codigoSunat?: string;
}

interface CuotaForm {
  numeroCuota: number;
  monto: number;
  fechaPago: string;
}

interface FormState {
  condicionPago: 1 | 2;
  numeroCuotas: number;
  cuotas: CuotaForm[];
  habilitadoDetraccion: boolean;
  codigoDetraccion: string;
  medioPagoDetraccion: string;
  porcentajeDetraccion: number;
  items: ItemForm[];
  notas: string;
}

const defaultItem: ItemForm = {
  descripcion: "",
  cantidad: 1,
  precioUnitario: 0,
  descuento: 0,
  igvPorcentaje: 18,
  afectacionIgv: "10",
  unidadMedida: "NIU",
};

function calcTotalVenta(items: ItemForm[]): number {
  return items.reduce((acc, item) => {
    const base = (item.precioUnitario - item.descuento) * item.cantidad;
    const igv = item.afectacionIgv === "10" ? base * (item.igvPorcentaje / 100) : 0;
    return acc + base + igv;
  }, 0);
}

function distribuirCuotas(total: number, n: number): CuotaForm[] {
  if (n <= 0) return [];
  const montoPorCuota = Number((total / n).toFixed(2));
  const cuotas: CuotaForm[] = [];
  let acumulado = 0;

  for (let i = 1; i <= n; i++) {
    const isLast = i === n;
    const monto = isLast
      ? Number((total - acumulado).toFixed(2))
      : montoPorCuota;

    const fecha = new Date();
    fecha.setMonth(fecha.getMonth() + i);

    cuotas.push({
      numeroCuota: i,
      monto,
      fechaPago: fecha.toISOString().split("T")[0],
    });
    acumulado += monto;
  }
  return cuotas;
}

// ─── Componente principal ────────────────────────────────────

export default function NewInvoicePage() {
  const [form, setForm] = useState<FormState>({
    condicionPago: 1,
    numeroCuotas: 3,
    cuotas: [],
    habilitadoDetraccion: false,
    codigoDetraccion: "",
    medioPagoDetraccion: "001",
    porcentajeDetraccion: 0,
    items: [{ ...defaultItem }],
    notas: "",
  });

  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // ── Totales calculados ──────────────────────────────────────
  const totalVenta = calcTotalVenta(form.items);
  const totalGravado = form.items
    .filter((i) => i.afectacionIgv === "10")
    .reduce((acc, i) => acc + (i.precioUnitario - i.descuento) * i.cantidad, 0);
  const totalIgv = form.items.reduce((acc, i) => {
    if (i.afectacionIgv !== "10") return acc;
    return acc + (i.precioUnitario - i.descuento) * i.cantidad * (i.igvPorcentaje / 100);
  }, 0);

  const montoDetraccion =
    form.habilitadoDetraccion && form.porcentajeDetraccion > 0
      ? calcularMontoDetraccion(totalVenta, form.porcentajeDetraccion)
      : 0;

  const sujeto = totalVenta >= DETRACCION_MONTO_MINIMO;

  // ── Manejadores de ítems ───────────────────────────────────
  const addItem = () =>
    setForm((f) => ({ ...f, items: [...f.items, { ...defaultItem }] }));

  const removeItem = (idx: number) =>
    setForm((f) => ({
      ...f,
      items: f.items.filter((_, i) => i !== idx),
    }));

  const updateItem = (idx: number, field: keyof ItemForm, value: string | number) =>
    setForm((f) => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [field]: value };
      return { ...f, items };
    });

  // ── Cambio de condición de pago ────────────────────────────
  const handleCondicionPago = useCallback(
    (value: string) => {
      const condicion = value === "2" ? 2 : (1 as 1 | 2);
      const cuotas =
        condicion === 2 ? distribuirCuotas(totalVenta, form.numeroCuotas) : [];
      setForm((f) => ({ ...f, condicionPago: condicion, cuotas }));
    },
    [totalVenta, form.numeroCuotas]
  );

  const handleNumeroCuotas = (n: number) => {
    const cuotas = distribuirCuotas(totalVenta, n);
    setForm((f) => ({ ...f, numeroCuotas: n, cuotas }));
  };

  const recalcularCuotas = () => {
    const cuotas = distribuirCuotas(totalVenta, form.numeroCuotas);
    setForm((f) => ({ ...f, cuotas }));
  };

  const updateCuota = (idx: number, field: keyof CuotaForm, value: string | number) =>
    setForm((f) => {
      const cuotas = [...f.cuotas];
      cuotas[idx] = { ...cuotas[idx], [field]: value };
      return { ...f, cuotas };
    });

  // ── Detracción ────────────────────────────────────────────
  const handleCodigoDetraccion = (codigo: string) => {
    const pct = getPorcentajeDetraccion(codigo) ?? 0;
    setForm((f) => ({
      ...f,
      codigoDetraccion: codigo,
      porcentajeDetraccion: pct,
    }));
  };

  // ── Asistente de IA ───────────────────────────────────────
  const handleAiAssist = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai/invoice-helper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const json = await res.json();
      if (!res.ok) {
        setAiError(json.error ?? "Error al procesar con IA.");
        return;
      }

      const { data } = json;

      // Pre-rellenar formulario con los datos de la IA
      setForm((f) => {
        const condicionPago: 1 | 2 = data.condicionPago ?? f.condicionPago;
        const numeroCuotas = data.numeroCuotas ?? f.numeroCuotas;
        const newItems: ItemForm[] =
          data.items && data.items.length > 0
            ? data.items.map(
                (i: {
                  descripcion: string;
                  cantidad: number;
                  precioUnitario?: number;
                  unidadMedida?: string;
                  codigoSunat?: string;
                }) => ({
                  descripcion: i.descripcion,
                  cantidad: i.cantidad,
                  precioUnitario: i.precioUnitario ?? 0,
                  descuento: 0,
                  igvPorcentaje: 18,
                  afectacionIgv: "10",
                  unidadMedida: i.unidadMedida ?? "NIU",
                  codigoSunat: i.codigoSunat,
                })
              )
            : f.items;

        const newTotal = calcTotalVenta(newItems);
        const cuotas =
          condicionPago === 2 ? distribuirCuotas(newTotal, numeroCuotas) : [];

        return {
          ...f,
          condicionPago,
          numeroCuotas,
          cuotas,
          items: newItems,
          notas: data.notas ?? f.notas,
        };
      });
    } catch {
      setAiError("No se pudo conectar con el asistente de IA.");
    } finally {
      setAiLoading(false);
    }
  };

  // ── Enviar formulario ─────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitLoading(true);
    setSubmitError(null);

    // Aquí iría la llamada real a POST /api/invoices con los datos del form
    // Por ahora simulamos el éxito con la estructura correcta
    setTimeout(() => {
      setSubmitLoading(false);
      setSubmitSuccess(true);
    }, 800);
  };

  // ── Datos para el preview ─────────────────────────────────
  const previewData: InvoicePreviewData = {
    tipoComprobante: "FACTURA",
    serie: "F001",
    moneda: "PEN",
    condicionPago: form.condicionPago,
    items: form.items,
    cuotas: form.cuotas,
    habilitadoDetraccion: form.habilitadoDetraccion,
    codigoDetraccion: form.codigoDetraccion || undefined,
    porcentajeDetraccion: form.porcentajeDetraccion || undefined,
    montoDetraccion: montoDetraccion || undefined,
    totalGravado: Number(totalGravado.toFixed(2)),
    totalIgv: Number(totalIgv.toFixed(2)),
    totalVenta: Number(totalVenta.toFixed(2)),
  };

  // ── Suma de cuotas ────────────────────────────────────────
  const sumaCuotas = form.cuotas.reduce((a, c) => a + c.monto, 0);
  const diferenciaCuotas = Math.abs(sumaCuotas - totalVenta);
  const cuotasValidas = diferenciaCuotas <= 0.1;

  return (
    <div className="max-w-screen-xl mx-auto">
      {/* Título */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nueva Factura</h1>
        <p className="text-sm text-gray-500 mt-1">
          Complete los datos del comprobante o use el asistente de IA
        </p>
      </div>

      {/* ── Asistente de IA ─────────────────────────────────── */}
      <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-indigo-600" />
          <span className="text-sm font-semibold text-indigo-700">
            Asistente de Emisión con IA
          </span>
        </div>
        <p className="text-xs text-indigo-600 mb-3">
          Describe la venta en lenguaje natural. Ej:{" "}
          <em>&ldquo;Venta de 5 laptops a crédito en 3 cuotas para el cliente RUC 20601234567&rdquo;</em>
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAiAssist()}
            placeholder="Describe la venta..."
            className="flex-1 rounded-lg border border-indigo-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleAiAssist}
            disabled={aiLoading || !aiPrompt.trim()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            {aiLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Sparkles size={14} />
            )}
            {aiLoading ? "Procesando..." : "Analizar"}
          </button>
        </div>
        {aiError && (
          <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
            <AlertCircle size={12} /> {aiError}
          </p>
        )}
      </div>

      {/* ── Layout principal: formulario + preview ──────────── */}
      <div className="flex gap-6 items-start">
        {/* Formulario */}
        <div className="flex-1 space-y-6">

          {/* ── Ítems ─────────────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h2 className="font-semibold text-sm text-gray-700">Ítems del comprobante</h2>
              <button
                onClick={addItem}
                className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3 py-1.5 transition-colors"
              >
                <Plus size={12} />
                Añadir ítem
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-2 text-left">Descripción</th>
                    <th className="px-2 py-2 text-right w-16">Cant.</th>
                    <th className="px-2 py-2 text-right w-24">P.Unit</th>
                    <th className="px-2 py-2 text-right w-20">Dscto.</th>
                    <th className="px-2 py-2 text-right w-20">Subtotal</th>
                    <th className="px-2 py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {form.items.map((item, i) => {
                    const base =
                      (item.precioUnitario - item.descuento) * item.cantidad;
                    const igv =
                      item.afectacionIgv === "10"
                        ? base * (item.igvPorcentaje / 100)
                        : 0;
                    const subtotal = base + igv;
                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={item.descripcion}
                            onChange={(e) =>
                              updateItem(i, "descripcion", e.target.value)
                            }
                            placeholder="Descripción del producto/servicio"
                            className="w-full border-0 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 rounded px-1"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            min="0.001"
                            step="0.001"
                            value={item.cantidad}
                            onChange={(e) =>
                              updateItem(i, "cantidad", Number(e.target.value))
                            }
                            className="w-full text-right border border-gray-200 rounded text-sm px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.precioUnitario}
                            onChange={(e) =>
                              updateItem(i, "precioUnitario", Number(e.target.value))
                            }
                            className="w-full text-right border border-gray-200 rounded text-sm px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.descuento}
                            onChange={(e) =>
                              updateItem(i, "descuento", Number(e.target.value))
                            }
                            className="w-full text-right border border-gray-200 rounded text-sm px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                          />
                        </td>
                        <td className="px-2 py-2 text-right font-medium text-gray-700">
                          S/ {subtotal.toFixed(2)}
                        </td>
                        <td className="px-2 py-2">
                          <button
                            onClick={() => removeItem(i)}
                            disabled={form.items.length === 1}
                            className="text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totales resumidos */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
              <div className="space-y-1 text-sm text-right">
                <div className="flex gap-8 text-gray-500">
                  <span>Op. Gravadas</span>
                  <span>S/ {totalGravado.toFixed(2)}</span>
                </div>
                <div className="flex gap-8 text-gray-500">
                  <span>IGV (18%)</span>
                  <span>S/ {totalIgv.toFixed(2)}</span>
                </div>
                <div className="flex gap-8 font-bold text-gray-900">
                  <span>TOTAL</span>
                  <span className="text-indigo-700">S/ {totalVenta.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Condición de pago ──────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-sm text-gray-700">Condición de Pago</h2>
            </div>

            <div className="p-5">
              <Tabs.Root
                value={String(form.condicionPago)}
                onValueChange={handleCondicionPago}
              >
                <Tabs.List className="flex rounded-xl bg-gray-100 p-1 mb-5 w-fit gap-1">
                  {([1, 2] as const).map((cp) => (
                    <Tabs.Trigger
                      key={cp}
                      value={String(cp)}
                      className="px-5 py-2 rounded-lg text-sm font-medium transition-all
                        data-[state=active]:bg-white data-[state=active]:shadow-sm
                        data-[state=active]:text-indigo-700 data-[state=active]:font-semibold
                        text-gray-500 hover:text-gray-700"
                    >
                      {CONDICION_PAGO_LABEL[cp]}
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>

                {/* Contado */}
                <Tabs.Content value="1">
                  <div className="flex items-center gap-3 text-sm text-green-700 bg-green-50 rounded-lg p-3 border border-green-200">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Pago al contado — Sin cuotas
                  </div>
                </Tabs.Content>

                {/* Crédito */}
                <Tabs.Content value="2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-medium text-gray-700">
                        Número de cuotas
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={36}
                          value={form.numeroCuotas}
                          onChange={(e) => handleNumeroCuotas(Number(e.target.value))}
                          className="w-20 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          onClick={recalcularCuotas}
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-3 py-1.5 transition-colors"
                        >
                          Distribuir equitativamente
                        </button>
                      </div>
                    </div>

                    {/* Tabla de cuotas */}
                    {form.cuotas.length > 0 && (
                      <div className="rounded-xl overflow-hidden border border-amber-200">
                        <table className="w-full text-sm">
                          <thead className="bg-amber-50 text-xs text-amber-700 uppercase">
                            <tr>
                              <th className="px-4 py-2 text-left">Cuota</th>
                              <th className="px-4 py-2 text-right">Monto</th>
                              <th className="px-4 py-2 text-right">Fecha vencimiento</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-amber-100">
                            {form.cuotas.map((cuota, i) => (
                              <tr key={cuota.numeroCuota} className="hover:bg-amber-50/50">
                                <td className="px-4 py-2 text-gray-600 font-medium">
                                  Cuota {cuota.numeroCuota}
                                </td>
                                <td className="px-4 py-2">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={cuota.monto}
                                    onChange={(e) =>
                                      updateCuota(i, "monto", Number(e.target.value))
                                    }
                                    className="w-full text-right border border-amber-200 rounded text-sm px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <input
                                    type="date"
                                    value={cuota.fechaPago}
                                    onChange={(e) =>
                                      updateCuota(i, "fechaPago", e.target.value)
                                    }
                                    className="w-full border border-amber-200 rounded text-sm px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-amber-400"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {/* Validación de suma */}
                        <div
                          className={`px-4 py-2 text-xs flex justify-between ${
                            cuotasValidas
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          <span>
                            Suma de cuotas: S/ {sumaCuotas.toFixed(2)}
                          </span>
                          <span>
                            {cuotasValidas
                              ? "✓ Coincide con el total"
                              : `✗ Diferencia: S/ ${diferenciaCuotas.toFixed(2)}`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </Tabs.Content>
              </Tabs.Root>
            </div>
          </div>

          {/* ── Detracción SUNAT ───────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-sm text-gray-700">Detracción SUNAT</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Aplica si el monto supera S/ {DETRACCION_MONTO_MINIMO.toFixed(2)}
                  {!sujeto && ` — Total actual: S/ ${totalVenta.toFixed(2)}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  {form.habilitadoDetraccion ? "Activada" : "Desactivada"}
                </span>
                <Switch.Root
                  checked={form.habilitadoDetraccion}
                  onCheckedChange={(checked) => {
                    setForm((f) => ({ ...f, habilitadoDetraccion: checked }));
                  }}
                  disabled={!sujeto}
                  className="relative inline-flex h-6 w-11 items-center rounded-full
                    bg-gray-200 transition-colors
                    data-[state=checked]:bg-indigo-600
                    disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Switch.Thumb className="block h-5 w-5 rounded-full bg-white shadow
                    transition-transform
                    data-[state=checked]:translate-x-5
                    data-[state=unchecked]:translate-x-0.5" />
                </Switch.Root>
              </div>
            </div>

            {form.habilitadoDetraccion && (
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Código de detracción */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Bien / Servicio (Catálogo 54)
                    </label>
                    <select
                      value={form.codigoDetraccion}
                      onChange={(e) => handleCodigoDetraccion(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Seleccionar...</option>
                      {CATALOGO54_OPTIONS.map((opt) => (
                        <option key={opt.code} value={opt.code}>
                          {opt.code} — {opt.descripcion} ({opt.porcentaje}%)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Medio de pago */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Medio de pago (Tabla 1)
                    </label>
                    <select
                      value={form.medioPagoDetraccion}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, medioPagoDetraccion: e.target.value }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {TABLA1_OPTIONS.map((opt) => (
                        <option key={opt.code} value={opt.code}>
                          {opt.code} — {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Resumen de detracción */}
                {form.codigoDetraccion && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex justify-between text-sm">
                    <div>
                      <span className="text-blue-700 font-medium">
                        Porcentaje: {form.porcentajeDetraccion}%
                      </span>
                      <span className="text-blue-500 text-xs ml-2">
                        (según Catálogo 54 SUNAT)
                      </span>
                    </div>
                    <div className="font-bold text-blue-800">
                      Monto detracción: S/ {montoDetraccion.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Notas ─────────────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas u observaciones
            </label>
            <textarea
              value={form.notas}
              onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))}
              rows={2}
              placeholder="Información adicional para el comprobante..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* ── Mensajes y botón de envío ──────────────────────── */}
          {submitError && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle size={16} />
              {submitError}
            </div>
          )}
          {submitSuccess && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
              Comprobante guardado correctamente
            </div>
          )}

          <div className="flex justify-end gap-3 pb-8">
            <button
              type="button"
              className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Guardar borrador
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitLoading || (form.condicionPago === 2 && !cuotasValidas)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
            >
              {submitLoading && <Loader2 size={14} className="animate-spin" />}
              Emitir comprobante
            </button>
          </div>
        </div>

        {/* ── Preview PDF ────────────────────────────────────── */}
        <div className="w-96 flex-shrink-0 sticky top-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Vista previa</h3>
            <button
              onClick={() => setShowPreview((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
              {showPreview ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          {showPreview && <InvoicePdfPreview data={previewData} />}
        </div>
      </div>
    </div>
  );
}
