import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../audit/audit.service';
import { v4 as uuidv4 } from 'uuid';
import { Reflector } from '@nestjs/core';

/**
 * Audit Interceptor
 * Automatically captures POST/PUT/PATCH/DELETE operations with:
 * - IP address
 * - User-Agent
 * - Request ID (generated or from header)
 * - Old/New values diff (for updates)
 *
 * Phase 3: Enhanced Audit System
 */

// Decorator to mark methods that should be audited
export const AUDIT_KEY = 'audit';
export interface AuditMetadata {
  action: string;
  entityType: string;
}

export const Audit = (metadata: AuditMetadata) =>
  Reflect.metadata(AUDIT_KEY, metadata);

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private auditService: AuditService,
    private reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Only audit mutations (POST, PUT, PATCH, DELETE)
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    // Check if this endpoint has @Audit() decorator
    const auditMetadata = this.reflector.get<AuditMetadata>(
      AUDIT_KEY,
      context.getHandler(),
    );

    if (!auditMetadata) {
      return next.handle();
    }

    // Extract request context
    const user = request.user;
    const organizationId = request.organizationId || user?.organizationId;
    const userId = user?.sub || user?.id;

    // Skip if no authenticated user
    if (!userId || !organizationId) {
      return next.handle();
    }

    // Extract audit metadata
    const ipAddress = this.extractIpAddress(request);
    const userAgent = request.headers['user-agent'] || null;
    const requestId = request.headers['x-request-id'] || uuidv4();

    // Store old values for PATCH/PUT (if entity exists)
    const oldValues = request.body?.__oldValues || null;

    return next.handle().pipe(
      tap(async (response) => {
        try {
          // Extract entity ID from response or params
          const entityId =
            response?.id || request.params?.id || request.body?.id || 'unknown';

          // For PATCH/PUT, capture the new values (the request body)
          const newValues =
            method === 'PUT' || method === 'PATCH' ? request.body : null;

          // Log to audit
          await this.auditService.log({
            organizationId,
            userId,
            action: auditMetadata.action,
            entityType: auditMetadata.entityType,
            entityId,
            metadata: {
              method,
              path: request.url,
              statusCode: context.switchToHttp().getResponse().statusCode,
            },
            ipAddress,
            userAgent,
            requestId,
            oldValues,
            newValues,
          });
        } catch (error) {
          // Silent fail - don't break the request if audit fails
          console.error('[AuditInterceptor] Failed to log audit:', error);
        }
      }),
    );
  }

  private extractIpAddress(request: any): string | null {
    // Check for proxied IP (CloudFlare, Nginx, etc.)
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    // Check for CloudFlare IP
    const cfConnectingIp = request.headers['cf-connecting-ip'];
    if (cfConnectingIp) {
      return cfConnectingIp;
    }

    // Check for real IP
    const realIp = request.headers['x-real-ip'];
    if (realIp) {
      return realIp;
    }

    // Fallback to socket IP
    return request.ip || request.connection?.remoteAddress || null;
  }
}
