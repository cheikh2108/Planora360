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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var StorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let StorageService = StorageService_1 = class StorageService {
    config;
    logger = new common_1.Logger(StorageService_1.name);
    s3 = null;
    bucket;
    useLocal;
    constructor(config) {
        this.config = config;
        const keyId = config.get('B2_KEY_ID');
        const appKey = config.get('B2_APP_KEY');
        this.bucket = config.get('B2_BUCKET') ?? 'ataaba-pilot';
        this.useLocal = !keyId || !appKey;
        if (!this.useLocal) {
            this.s3 = new client_s3_1.S3Client({
                endpoint: config.get('B2_ENDPOINT') ?? 'https://s3.us-east-005.backblazeb2.com',
                region: config.get('B2_REGION') ?? 'us-east-005',
                credentials: { accessKeyId: keyId, secretAccessKey: appKey },
            });
            this.logger.log('Stockage : Backblaze B2');
        }
        else {
            this.logger.warn('Stockage : local (uploads/) — configurer B2_KEY_ID et B2_APP_KEY pour la production');
        }
    }
    async upload(storageKey, file) {
        if (this.useLocal) {
            const dest = path.join(process.cwd(), 'uploads', storageKey);
            fs.mkdirSync(path.dirname(dest), { recursive: true });
            fs.writeFileSync(dest, file.buffer ?? fs.readFileSync(file.path));
            return storageKey;
        }
        await this.s3.send(new client_s3_1.PutObjectCommand({
            Bucket: this.bucket,
            Key: storageKey,
            Body: file.buffer,
            ContentType: file.mimetype,
            ContentLength: file.size,
        }));
        return storageKey;
    }
    async getSignedUrl(storageKey, expiresInSeconds = 3600) {
        if (this.useLocal) {
            return `/api/files/${encodeURIComponent(storageKey)}`;
        }
        return (0, s3_request_presigner_1.getSignedUrl)(this.s3, new client_s3_1.GetObjectCommand({ Bucket: this.bucket, Key: storageKey }), { expiresIn: expiresInSeconds });
    }
    getPublicUrl(storageKey) {
        if (this.useLocal) {
            return `/uploads/${storageKey}`;
        }
        const endpoint = this.config.get('B2_ENDPOINT') ?? 'https://s3.us-east-005.backblazeb2.com';
        const regionCode = endpoint.match(/us-east-(\d+)/)?.[1] || '005';
        return `https://f${regionCode}.backblazeb2.com/file/${this.bucket}/${storageKey}`;
    }
    async delete(storageKey) {
        if (this.useLocal) {
            const filePath = path.join(process.cwd(), 'uploads', storageKey);
            if (fs.existsSync(filePath))
                fs.unlinkSync(filePath);
            return;
        }
        await this.s3.send(new client_s3_1.DeleteObjectCommand({ Bucket: this.bucket, Key: storageKey }));
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = StorageService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map