import { TipoComprobante } from "@/domain/value-objects/tipo-comprobante.vo";

export interface Serie {
  id: string;
  tenantId: string;
  companyId: string;
  establishmentId?: string;
  tipoComprobante: TipoComprobante;
  /** Serie alfanumérica (ej: F001, B001, FC01) */
  serieAlfanumerica: string;
  /** Último correlativo emitido */
  correlativo: number;
  correlativoPad: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
