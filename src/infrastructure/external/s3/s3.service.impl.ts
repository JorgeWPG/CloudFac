import AWS from "aws-sdk";
import {
  StorageService,
  UploadFileParams,
  UploadFileResult,
} from "@/application/services/storage.service";

/**
 * Implementación del servicio de almacenamiento usando AWS S3.
 * Gestiona PDFs, XMLs, CDRs y vouchers de pago.
 */
export class S3ServiceImpl implements StorageService {
  private readonly s3: AWS.S3;
  private readonly bucket: string;
  private readonly bucketUrl: string;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION ?? "us-east-1",
    });
    this.bucket = process.env.AWS_S3_BUCKET ?? "";
    this.bucketUrl = process.env.AWS_S3_BUCKET_URL ?? "";

    if (!this.bucket) {
      throw new Error("AWS_S3_BUCKET no está configurado.");
    }
  }

  async upload(params: UploadFileParams): Promise<UploadFileResult> {
    await this.s3
      .putObject({
        Bucket: this.bucket,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
        ACL: params.isPublic ? "public-read" : "private",
      })
      .promise();

    const url = params.isPublic
      ? `${this.bucketUrl}/${params.key}`
      : await this.getPresignedUrl(params.key);

    return { url, key: params.key };
  }

  async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    return this.s3.getSignedUrlPromise("getObject", {
      Bucket: this.bucket,
      Key: key,
      Expires: expiresIn,
    });
  }

  async delete(key: string): Promise<void> {
    await this.s3
      .deleteObject({
        Bucket: this.bucket,
        Key: key,
      })
      .promise();
  }
}

/**
 * Genera la clave S3 para documentos de comprobantes.
 * Formato: {tenantId}/comprobantes/{año}/{mes}/{numeroCompleto}.{ext}
 */
export function buildInvoiceS3Key(
  tenantId: string,
  numeroCompleto: string,
  ext: "pdf" | "xml" | "cdr",
  date = new Date()
): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${tenantId}/comprobantes/${year}/${month}/${numeroCompleto}.${ext}`;
}

/**
 * Genera la clave S3 para vouchers de pago.
 * Formato: {tenantId}/vouchers/{año}/{mes}/{paymentId}.{ext}
 */
export function buildVoucherS3Key(
  tenantId: string,
  paymentId: string,
  ext: string,
  date = new Date()
): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${tenantId}/vouchers/${year}/${month}/${paymentId}.${ext}`;
}
