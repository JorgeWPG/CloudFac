export interface UploadFileParams {
  key: string;
  body: Buffer | Uint8Array | string;
  contentType: string;
  /** Si true, el archivo es accesible públicamente */
  isPublic?: boolean;
}

export interface UploadFileResult {
  url: string;
  key: string;
}

/**
 * Contrato del servicio de almacenamiento de archivos (AWS S3).
 * Maneja PDFs, XMLs, CDRs y vouchers de pago.
 */
export interface StorageService {
  /**
   * Sube un archivo al bucket S3 y retorna la URL y key del objeto.
   */
  upload(params: UploadFileParams): Promise<UploadFileResult>;

  /**
   * Genera una URL pre-firmada válida por `expiresIn` segundos.
   */
  getPresignedUrl(key: string, expiresIn?: number): Promise<string>;

  /**
   * Elimina un objeto del bucket S3.
   */
  delete(key: string): Promise<void>;
}
