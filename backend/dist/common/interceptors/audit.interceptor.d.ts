import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuditService } from '../../audit/audit.service';
import { Reflector } from '@nestjs/core';
export declare const AUDIT_KEY = "audit";
export interface AuditMetadata {
    action: string;
    entityType: string;
}
export declare const Audit: (metadata: AuditMetadata) => {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare class AuditInterceptor implements NestInterceptor {
    private auditService;
    private reflector;
    constructor(auditService: AuditService, reflector: Reflector);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private extractIpAddress;
}
