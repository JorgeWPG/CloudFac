import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Resumen de tu actividad de facturación
        </p>
      </div>

      {/* KPI Cards — placeholder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Comprobantes este mes", value: "—" },
          { label: "Total facturado (S/)", value: "—" },
          { label: "Pendientes de pago", value: "—" },
          { label: "Rechazados SUNAT", value: "—" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm"
          >
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              {kpi.label}
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{kpi.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
