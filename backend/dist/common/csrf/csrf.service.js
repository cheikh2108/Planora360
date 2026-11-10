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
exports.CsrfService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const config_1 = require("@nestjs/config");
let CsrfService = class CsrfService {
    config;
    secret;
    constructor(config) {
        this.config = config;
        this.secret = this.config.get('CSRF_SECRET') || this.config.get('JWT_SECRET') || 'fallback-secret';
    }
    generateToken() {
        const random = (0, crypto_1.randomBytes)(32).toString('hex');
        const signature = this.sign(random);
        return `${random}.${signature}`;
    }
    validateToken(token) {
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
    sign(value) {
        return (0, crypto_1.createHmac)('sha256', this.secret)
            .update(value)
            .digest('hex');
    }
};
exports.CsrfService = CsrfService;
exports.CsrfService = CsrfService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], CsrfService);
//# sourceMappingURL=csrf.service.js.map