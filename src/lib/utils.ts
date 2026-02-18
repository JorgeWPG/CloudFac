import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea un número como moneda peruana (S/ o USD).
 */
export function formatCurrency(
  amount: number,
  moneda: "PEN" | "USD" = "PEN"
): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: moneda,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Formatea una fecha en el formato peruano dd/MM/yyyy.
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Valida el dígito verificador de un RUC peruano de 11 dígitos.
 */
export function validateRuc(ruc: string): boolean {
  if (!/^\d{11}$/.test(ruc)) return false;

  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;

  for (let i = 0; i < 10; i++) {
    sum += parseInt(ruc[i]) * weights[i];
  }

  const remainder = sum % 11;
  const digit = remainder < 2 ? remainder : 11 - remainder;
  return digit === parseInt(ruc[10]);
}

/**
 * Valida el dígito verificador de un DNI peruano de 8 dígitos.
 */
export function validateDni(dni: string): boolean {
  return /^\d{8}$/.test(dni);
}

/**
 * Genera el número completo de un comprobante (ej: F001-00001234).
 */
export function buildNumeroComprobante(
  serie: string,
  correlativo: number,
  pad = 8
): string {
  return `${serie}-${String(correlativo).padStart(pad, "0")}`;
}
