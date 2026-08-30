import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3: S3Client | null = null;
  private bucket: string;
  private useLocal: boolean;

  constructor(private config: ConfigService) {
    const keyId = config.get('B2_KEY_ID');
    const appKey = config.get('B2_APP_KEY');
    this.bucket = config.get('B2_BUCKET') ?? 'ataaba-pilot';
    this.useLocal = !keyId || !appKey;

    if (!this.useLocal) {
      this.s3 = new S3Client({
        endpoint: config.get('B2_ENDPOINT') ?? 'https://s3.us-east-005.backblazeb2.com',
        region: config.get('B2_REGION') ?? 'us-east-005',
        credentials: { accessKeyId: keyId!, secretAccessKey: appKey! },
      });
      this.logger.log('Stockage : Backblaze B2');
    } else {
      this.logger.warn('Stockage : local (uploads/) — configurer B2_KEY_ID et B2_APP_KEY pour la production');
    }
  }

  async upload(storageKey: string, file: Express.Multer.File): Promise<string> {
    if (this.useLocal) {
      const dest = path.join(process.cwd(), 'uploads', storageKey);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, file.buffer ?? fs.readFileSync(file.path));
      return storageKey;
    }

    await this.s3!.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: storageKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentLength: file.size,
    }));

    return storageKey;
  }

  async getSignedUrl(storageKey: string, expiresInSeconds = 3600): Promise<string> {
    if (this.useLocal) {
      return `/api/files/${encodeURIComponent(storageKey)}`;
    }

    return getSignedUrl(
      this.s3!,
      new GetObjectCommand({ Bucket: this.bucket, Key: storageKey }),
      { expiresIn: expiresInSeconds },
    );
  }

  /**
   * Obtenir l'URL publique d'un fichier Backblaze B2
   * Format: https://f005.backblazeb2.com/file/{bucket}/{key}
   */
  getPublicUrl(storageKey: string): string {
    if (this.useLocal) {
      return `/uploads/${storageKey}`;
    }

    // URL publique Backblaze B2
    // Format: https://f{region-code}.backblazeb2.com/file/{bucket}/{key}
    const endpoint = this.config.get('B2_ENDPOINT') ?? 'https://s3.us-east-005.backblazeb2.com';
    const regionCode = endpoint.match(/us-east-(\d+)/)?.[1] || '005';
    return `https://f${regionCode}.backblazeb2.com/file/${this.bucket}/${storageKey}`;
  }

  async delete(storageKey: string): Promise<void> {
    if (this.useLocal) {
      const filePath = path.join(process.cwd(), 'uploads', storageKey);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return;
    }

    await this.s3!.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: storageKey }));
  }
}
