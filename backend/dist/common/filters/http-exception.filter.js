"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var HttpExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const Sentry = __importStar(require("@sentry/nestjs"));
let HttpExceptionFilter = HttpExceptionFilter_1 = class HttpExceptionFilter {
    logger = new common_1.Logger(HttpExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception instanceof common_1.HttpException
            ? exception.getResponse()
            : 'Une erreur interne est survenue';
        const shouldIgnoreForSentry = this.shouldIgnoreForSentry(exception, status);
        if (status >= 500) {
            this.logger.error(`${request.method} ${request.url}`, exception instanceof Error ? exception.stack : exception);
            if (!shouldIgnoreForSentry) {
                Sentry.withScope((scope) => {
                    scope.setContext('http', {
                        method: request.method,
                        url: request.url,
                        query: request.query,
                        statusCode: status,
                    });
                    if (request.user) {
                        scope.setUser({
                            id: request.user.sub || request.user.id,
                            email: request.user.email,
                        });
                    }
                    if (request.organizationId) {
                        scope.setTag('organizationId', request.organizationId);
                    }
                    if (exception instanceof Error) {
                        Sentry.captureException(exception);
                    }
                    else {
                        Sentry.captureMessage(`Unhandled error: ${JSON.stringify(exception)}`, 'error');
                    }
                });
            }
        }
        const errorResponse = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: typeof message === 'string' ? message : message.message || message,
            ...(process.env.NODE_ENV !== 'production' && exception instanceof Error
                ? { stack: exception.stack }
                : {}),
        };
        response.status(status).json(errorResponse);
    }
    shouldIgnoreForSentry(exception, status) {
        if (status === common_1.HttpStatus.SERVICE_UNAVAILABLE) {
            if (exception instanceof common_1.ServiceUnavailableException) {
                const response = exception.getResponse();
                if (typeof response === 'object' && 'message' in response) {
                    const message = response.message;
                    if (typeof message === 'string' && message.toLowerCase().includes('maintenance')) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = HttpExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map