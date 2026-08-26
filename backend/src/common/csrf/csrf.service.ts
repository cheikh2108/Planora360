import { Injectable } from '@nestjs/common';
import { randomBytes, createHmac } from 'crypto';
import { ConfigService } from '@nestjs/config';

/**
 * CSRF Token Service
 * Génère et valide les tokens CSRF pour protéger contre les attaques Cross-Site Request Forgery
 */
@Injectable()
export class CsrfService {
  private readonly secret: string;

  constructor(private config: ConfigService) {
    this.secret = this.config.get<string>('CSRF_SECRET') || this.config.get<string>('JWT_SECRET') || 'fallback-secret';
  }

  /**
   * Génère un nouveau token CSRF
   * Format: {random}.{signature}
   */
  generateToken(): string {
    const random = randomBytes(32).toString('hex');
    const signature = this.sign(random);
    return `${random}.${signature}`;
  }

  /**
   * Valide un token CSRF
   */
  validateToken(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }

    const parts = token.split('.');
    if (parts.length !== 2) {
      return false;
    }

    const [random, signature] = parts;
    const expectedSignature = this.sign(random);

    return signature === expectedSignature;
  }

  /**
   * Signe une valeur avec HMAC-SHA256
   */
  private sign(value: string): string {
    return createHmac('sha256', this.secret)
      .update(value)
      .digest('hex');
  }
}
