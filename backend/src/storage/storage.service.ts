import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Stockage des fichiers : Backblaze B2 en production, dossier local uploads/ sinon.
 *
 * Règles :
 * - une clé de stockage commence TOUJOURS par l'organizationId (contrôle d'accès dans FilesController) ;
 * - elle ne contient jamais le nom d'origine du fichier (pas de traversée de chemin, pas de fuite de nom) ;
 * - on stocke la clé en base, jamais une URL signée (qui expire) ;
 * - les fichiers sont servis par GET /api/files/<clé> (authentifié), jamais en statique.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3: S3Client | null = null;
  private bucket: string;
  private useLocal: boolean;
  private readonly localRoot = path.resolve(process.cwd(), 'uploads');

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

  get isLocal(): boolean {
    return this.useLocal;
  }

  /** Construit une clé sûre : <organizationId>/<segments...>/<uuid>.<ext> */
  buildKey(organizationId: string, segments: string[], extension: string): string {
    const clean = (s: string) => s.replace(/[^A-Za-z0-9_-]/g, '');
    const ext = clean(extension.toLowerCase());
    return [clean(organizationId), ...segments.map(clean), `${randomUUID()}${ext ? `.${ext}` : ''}`].join('/');
  }

  /** URL stable (non signée) à exposer au frontend. */
  fileUrl(storageKey: string): string {
    return `/api/files/${storageKey.split('/').map(encodeURIComponent).join('/')}`;
  }

  /** Retrouve la clé à partir d'une valeur stockée (clé brute ou ancienne URL /api/files/... ou /uploads/...). */
  keyFromStored(value: string): string {
    if (!value) return value;
    for (const prefix of ['/api/files/', '/uploads/']) {
      if (value.startsWith(prefix)) return decodeURIComponent(value.slice(prefix.length).split('?')[0]);
    }
    const b2 = value.match(/\/file\/[^/]+\/(.+?)(\?|$)/);
    if (b2) return decodeURIComponent(b2[1]);
    return value;
  }

  /** Chemin local sûr d'une clé (refuse toute sortie du dossier uploads/). */
  localPath(storageKey: string): string | null {
    const resolved = path.resolve(this.localRoot, storageKey);
    if (!resolved.startsWith(this.localRoot + path.sep)) return null;
    return resolved;
  }

  async upload(storageKey: string, file: Express.Multer.File): Promise<string> {
    if (this.useLocal) {
      const dest = this.localPath(storageKey);
      if (!dest) throw new Error('Clé de stockage invalide');
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

  /**
   * URL de téléchargement. En local : route authentifiée de l'API.
   * Sur B2 : URL présignée de courte durée.
   */
  async getSignedUrl(storageKey: string, expiresInSeconds = 300): Promise<string> {
    if (this.useLocal) {
      return this.fileUrl(storageKey);
    }

    return getSignedUrl(
      this.s3!,
      new GetObjectCommand({ Bucket: this.bucket, Key: storageKey }),
      { expiresIn: expiresInSeconds },
    );
  }

  async delete(storageKey: string): Promise<void> {
    const key = this.keyFromStored(storageKey);
    if (this.useLocal) {
      const filePath = this.localPath(key);
      if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
      return;
    }

    await this.s3!.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }
}
