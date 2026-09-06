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
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function uploadEmailAssets() {
    const s3 = new client_s3_1.S3Client({
        endpoint: 'https://s3.us-east-005.backblazeb2.com',
        region: 'us-east-005',
        credentials: {
            accessKeyId: '0050d9227f9a5a90000000001',
            secretAccessKey: 'K0053EMuWse5tV1zQqa69M9CtqkgpMg',
        },
    });
    const bucket = 'ataaba-pilot';
    const logoPath = path.join(__dirname, '../../frontend/public/logo-light.svg');
    console.log('📤 Upload du logo email vers B2...');
    const logoContent = fs.readFileSync(logoPath);
    await s3.send(new client_s3_1.PutObjectCommand({
        Bucket: bucket,
        Key: 'email-assets/logo-light.svg',
        Body: logoContent,
        ContentType: 'image/svg+xml',
        CacheControl: 'public, max-age=31536000',
    }));
    const publicUrl = 'https://f005.backblazeb2.com/file/ataaba-pilot/email-assets/logo-light.svg';
    console.log('✅ Logo uploadé avec succès !');
    console.log(`📍 URL publique : ${publicUrl}`);
    console.log('\n💡 Mettez à jour email-templates.ts avec cette URL');
}
uploadEmailAssets()
    .then(() => process.exit(0))
    .catch((err) => {
    console.error('❌ Erreur:', err);
    process.exit(1);
});
//# sourceMappingURL=upload-email-assets.js.map