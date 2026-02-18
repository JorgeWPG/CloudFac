export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <span className="text-xl font-bold text-indigo-700">CloudFac</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Comprobantes", href: "/dashboard/invoices" },
            { label: "Clientes", href: "/dashboard/customers" },
            { label: "Productos", href: "/dashboard/products" },
            { label: "Empresas", href: "/dashboard/companies" },
            { label: "Series", href: "/dashboard/series" },
            { label: "Pagos", href: "/dashboard/payments" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
