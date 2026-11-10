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
exports.CsrfGuard = void 0;
const common_1 = require("@nestjs/common");
const csrf_service_1 = require("../csrf/csrf.service");
let CsrfGuard = class CsrfGuard {
    csrfService;
    constructor(csrfService) {
        this.csrfService = csrfService;
    }
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
            return true;
        }
        const path = request.path ?? request.url.split('?')[0];
        if (/^\/(api\/)?auth\/(login|register|refresh|request-quote|forgot-password|reset-password|reset-password\/check)$/.test(path)) {
            return true;
        }
        if (/^\/(api\/)?dexpay\/webhook$/.test(path)) {
            return true;
        }
        const csrfCookie = request.cookies?.['csrf-token'];
        const csrfHeader = request.headers['x-csrf-token'];
        if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
            throw new common_1.ForbiddenException('Invalid CSRF token');
        }
        if (!this.csrfService.validateToken(csrfCookie)) {
            throw new common_1.ForbiddenException('Invalid CSRF token');
        }
        return true;
    }
};
exports.CsrfGuard = CsrfGuard;
exports.CsrfGuard = CsrfGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [csrf_service_1.CsrfService])
], CsrfGuard);
//# sourceMappingURL=csrf.guard.js.map