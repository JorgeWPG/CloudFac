import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

/**
 * POST /api/ai/invoice-helper
 *
 * Asistente de emisión basado en IA.
 * Recibe un texto en lenguaje natural y devuelve un JSON estructurado
 * para pre-rellenar el formulario de factura.
 *
 * Ejemplo de entrada:
 *   "Venta de 5 laptops a crédito en 3 cuotas para el cliente RUC 20601234567"
 *
 * Requiere: OPENAI_API_KEY en variables de entorno.
 */

// Esquema de la respuesta estructurada que devolverá la IA
const InvoiceHelperResponseSchema = z.object({
  // Datos del cliente detectados en el texto
  cliente: z
    .object({
      tipoDocumento: z.enum(["RUC", "DNI", "CE", "PASAPORTE"]).optional(),
      numeroDocumento: z.string().optional(),
      razonSocial: z.string().optional(),
    })
    .optional(),

  // Tipo de comprobante sugerido
  tipoComprobante: z
    .enum(["FACTURA", "BOLETA", "NOTA_CREDITO", "NOTA_DEBITO"])
    .optional(),

  // Condición de pago: 1=Contado, 2=Crédito
  condicionPago: z.union([z.literal(1), z.literal(2)]).optional(),

  // Número de cuotas (si es a crédito)
  numeroCuotas: z.number().int().positive().optional(),

  // Ítems detectados en el texto
  items: z.array(
    z.object({
      descripcion: z.string(),
      cantidad: z.number().positive(),
      // Precio unitario SIN IGV estimado (puede ser 0 si no se menciona)
      precioUnitario: z.number().nonnegative().optional(),
      unidadMedida: z.string().optional(),
      // Código SUNAT sugerido (si se puede inferir del producto)
      codigoSunat: z.string().optional(),
    })
  ),

  // Moneda detectada
  moneda: z.enum(["PEN", "USD"]).optional(),

  // Serie sugerida (si se menciona o se puede inferir)
  serieSugerida: z.string().optional(),

  // Notas libres extraídas del texto
  notas: z.string().optional(),

  // Nivel de confianza del parsing (0-1)
  confianza: z.number().min(0).max(1).optional(),

  // Campos que el sistema no pudo determinar y necesitan completarse
  camposFaltantes: z.array(z.string()).optional(),
});

export type InvoiceHelperResponse = z.infer<typeof InvoiceHelperResponseSchema>;

const SYSTEM_PROMPT = `Eres un asistente especializado en facturación electrónica peruana (SUNAT).
Tu tarea es parsear texto en lenguaje natural y extraer información para pre-rellenar formularios de facturas.

Reglas:
- Si el RUC tiene 11 dígitos → tipoDocumento = "RUC", tipoComprobante = "FACTURA"
- Si el DNI tiene 8 dígitos → tipoDocumento = "DNI", tipoComprobante = "BOLETA"
- Si se menciona "crédito", "cuotas" → condicionPago = 2
- Si se menciona "contado", "al contado", "efectivo" → condicionPago = 1
- Detecta la cantidad de cuotas si se menciona (ej: "3 cuotas" → numeroCuotas = 3)
- Para productos como laptops, computadoras → unidadMedida = "NIU", codigoSunat = "25111500"
- Para servicios → unidadMedida = "ZZ"
- Para montos en soles → moneda = "PEN", en dólares → moneda = "USD"
- La serie sugerida: facturas = "F001", boletas = "B001"
- Lista en camposFaltantes los campos críticos que no puedas determinar (ej: "serieId", "precioUnitario")
- El campo confianza indica qué tan bien pudiste parsear el texto (0=no pude, 1=todo claro)

Responde SOLO con el JSON estructurado, sin texto adicional.`;

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "El campo 'prompt' es requerido." },
        { status: 400 }
      );
    }

    if (prompt.length > 1000) {
      return NextResponse.json(
        { error: "El texto no puede superar los 1000 caracteres." },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "El asistente de IA no está configurado (OPENAI_API_KEY faltante)." },
        { status: 503 }
      );
    }

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: InvoiceHelperResponseSchema,
      system: SYSTEM_PROMPT,
      prompt: `Parsea el siguiente texto para extraer datos de factura:\n\n"${prompt}"`,
    });

    return NextResponse.json({
      success: true,
      data: object,
    });
  } catch (error) {
    console.error("[POST /api/ai/invoice-helper]", error);

    // Si la IA falla, devolvemos un error descriptivo
    const message =
      error instanceof Error ? error.message : "Error al procesar con IA.";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
