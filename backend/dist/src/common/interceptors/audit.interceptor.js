"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditInterceptor = exports.Audit = exports.AUDIT_KEY = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const audit_service_1 = require("../../audit/audit.service");
const uuid_1 = require("uuid");
const core_1 = require("@nestjs/core");
exports.AUDIT_KEY = 'audit';
const Audit = (metadata) => Reflect.metadata(exports.AUDIT_KEY, metadata);
exports.Audit = Audit;
let AuditInterceptor = class AuditInterceptor {
    auditService;
    reflector;
    constructor(auditService, reflector) {
        this.auditService = auditService;
        this.reflector = reflector;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            return next.handle();
        }
        const auditMetadata = this.reflector.get(exports.AUDIT_KEY, context.getHandler());
        if (!auditMetadata) {
            return next.handle();
        }
        const user = request.user;
        const organizationId = request.organizationId || user?.organizationId;
        const userId = user?.sub || user?.id;
        if (!userId || !organizationId) {
            return next.handle();
        }
        const ipAddress = this.extractIpAddress(request);
        const userAgent = request.headers['user-agent'] || null;
        const requestId = request.headers['x-request-id'] || (0, uuid_1.v4)();
        const oldValues = request.body?.__oldValues || null;
        return next.handle().pipe((0, operators_1.tap)(async (response) => {
            try {
                const entityId = response?.id || request.params?.id || request.body?.id || 'unknown';
                const newValues = method === 'PUT' || method === 'PATCH' ? request.body : null;
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
            }
            catch (error) {
                console.error('[AuditInterceptor] Failed to log audit:', error);
            }
        }));
    }
    extractIpAddress(request) {
        const forwarded = request.headers['x-forwarded-for'];
        if (forwarded) {
            return forwarded.split(',')[0].trim();
        }
        const cfConnectingIp = request.headers['cf-connecting-ip'];
        if (cfConnectingIp) {
            return cfConnectingIp;
        }
        const realIp = request.headers['x-real-ip'];
        if (realIp) {
            return realIp;
        }
        return request.ip || request.connection?.remoteAddress || null;
    }
};
exports.AuditInterceptor = AuditInterceptor;
exports.AuditInterceptor = AuditInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [audit_service_1.AuditService,
        core_1.Reflector])
], AuditInterceptor);
//# sourceMappingURL=audit.interceptor.js.map