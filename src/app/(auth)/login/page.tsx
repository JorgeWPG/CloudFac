import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">CloudFac</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ingresa a tu cuenta de facturación
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
