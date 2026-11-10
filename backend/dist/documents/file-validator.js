"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MEDIA_EXTENSIONS = exports.DOCUMENT_EXTENSIONS = void 0;
exports.validateFile = validateFile;
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const MAGIC_TO_EXTS = {
    'application/pdf': ['pdf'],
    'application/zip': ['docx', 'xlsx', 'pptx'],
    'application/msoffice': ['doc', 'xls', 'ppt'],
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
};
exports.DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png'];
exports.MEDIA_EXTENSIONS = [...exports.DOCUMENT_EXTENSIONS, 'gif', 'webp'];
const DEFAULT_MAX_SIZE = 20 * 1024 * 1024;
function detectMime(buf) {
    if (!buf || buf.length < 4)
        return null;
    if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff)
        return 'image/jpeg';
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47)
        return 'image/png';
    if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38)
        return 'image/gif';
    if (buf.length >= 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP')
        return 'image/webp';
    if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46)
        return 'application/pdf';
    if (buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04)
        return 'application/zip';
    if (buf[0] === 0xd0 && buf[1] === 0xcf && buf[2] === 0x11 && buf[3] === 0xe0)
        return 'application/msoffice';
    return null;
}
async function validateFile(file, opts = {}) {
    const allowed = opts.allowed ?? exports.DOCUMENT_EXTENSIONS;
    const maxSize = opts.maxSize ?? DEFAULT_MAX_SIZE;
    if (!file?.buffer) {
        throw new common_1.UnprocessableEntityException('Fichier manquant ou illisible');
    }
    if (file.size > maxSize) {
        throw new common_1.UnprocessableEntityException(`Fichier trop volumineux (max ${Math.round(maxSize / 1024 / 1024)} Mo)`);
    }
    const ext = (0, path_1.extname)(file.originalname ?? '').toLowerCase().replace('.', '');
    if (!ext || !allowed.includes(ext)) {
        throw new common_1.UnprocessableEntityException(`Extension non autorisée : .${ext || '(aucune)'}. Formats acceptés : ${allowed.join(', ')}`);
    }
    const magic = detectMime(file.buffer);
    if (!magic) {
        throw new common_1.UnprocessableEntityException('Impossible de vérifier le type réel du fichier. Téléversement refusé.');
    }
    if (!MAGIC_TO_EXTS[magic]?.includes(ext)) {
        throw new common_1.UnprocessableEntityException(`Le contenu du fichier ne correspond pas à l'extension .${ext}.`);
    }
    return ext;
}
//# sourceMappingURL=file-validator.js.map