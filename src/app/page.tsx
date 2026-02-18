import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-8">
      <div className="max-w-3xl text-center space-y-8">
        {/* Logo / Brand */}
        <div className="space-y-2">
          <h1 className="text-5xl font-bold text-indigo-700 tracking-tight">
            CloudFac
          </h1>
          <p className="text-xl text-gray-600">
            Facturación Electrónica para Perú
          </p>
        </div>

        {/* Descripción */}
        <p className="text-gray-500 text-lg leading-relaxed">
          Emite facturas, boletas y notas de crédito electrónicas de forma
          sencilla. Integrado con{" "}
          <span className="font-semibold text-indigo-600">SUNAT</span> vía{" "}
          <span className="font-semibold text-indigo-600">NubeFact</span>.
          Multi-empresa, multi-establecimiento y control de inventario incluido.
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left mt-8">
          {[
            {
              title: "Facturas y Boletas",
              desc: "Emite comprobantes electrónicos aceptados por SUNAT en segundos.",
            },
            {
              title: "Multi-Empresa",
              desc: "Gestiona múltiples RUCs y establecimientos desde una sola cuenta.",
            },
            {
              title: "Control de Pagos",
              desc: "Registra pagos y adjunta vouchers almacenados en la nube.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              <h3 className="font-semibold text-gray-800 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/login"
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 bg-white text-indigo-600 border border-indigo-200 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
          >
            Crear Cuenta Gratis
          </Link>
        </div>
      </div>
    </main>
  );
}
