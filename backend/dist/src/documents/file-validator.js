"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFile = validateFile;
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const ALLOWED = {
    'application/pdf': ['pdf'],
    'application/msword': ['doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
    'application/vnd.ms-excel': ['xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
    'application/vnd.ms-powerpoint': ['ppt'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['pptx'],
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
};
const MAX_SIZE = 20 * 1024 * 1024;
function detectMime(buf) {
    if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF)
        return 'image/jpeg';
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47)
        return 'image/png';
    if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46)
        return 'application/pdf';
    if (buf[0] === 0x50 && buf[1] === 0x4B && buf[2] === 0x03 && buf[3] === 0x04)
        return 'application/zip';
    if (buf[0] === 0xD0 && buf[1] === 0xCF && buf[2] === 0x11 && buf[3] === 0xE0)
        return 'application/msoffice';
    return null;
}
const ZIP_EXTS = ['docx', 'xlsx', 'pptx'];
const MSOFFICE_EXTS = ['doc', 'xls', 'ppt'];
async function validateFile(file) {
    if (file.size > MAX_SIZE) {
        throw new common_1.UnprocessableEntityException('Fichier trop volumineux (max 20 Mo)');
    }
    const ext = (0, path_1.extname)(file.originalname).toLowerCase().replace('.', '');
    const allowedExts = Object.values(ALLOWED).flat();
    if (!ext || !allowedExts.includes(ext)) {
        throw new common_1.UnprocessableEntityException(`Extension non autorisée : .${ext || '(aucune)'}. Formats acceptés : ${allowedExts.join(', ')}`);
    }
    const magic = detectMime(file.buffer);
    if (!magic) {
        throw new common_1.UnprocessableEntityException('Impossible de vérifier le type réel du fichier. Téléversement refusé.');
    }
    if (magic === 'application/zip' && !ZIP_EXTS.includes(ext)) {
        throw new common_1.UnprocessableEntityException(`Le contenu du fichier ne correspond pas à l'extension .${ext}.`);
    }
    if (magic === 'application/msoffice' && !MSOFFICE_EXTS.includes(ext)) {
        throw new common_1.UnprocessableEntityException(`Le contenu du fichier ne correspond pas à l'extension .${ext}.`);
    }
    if (magic === 'image/jpeg' && ext !== 'jpg' && ext !== 'jpeg') {
        throw new common_1.UnprocessableEntityException(`Le contenu du fichier ne correspond pas à l'extension .${ext}.`);
    }
    if (magic === 'image/png' && ext !== 'png') {
        throw new common_1.UnprocessableEntityException(`Le contenu du fichier ne correspond pas à l'extension .${ext}.`);
    }
    if (magic === 'application/pdf' && ext !== 'pdf') {
        throw new common_1.UnprocessableEntityException(`Le contenu du fichier ne correspond pas à l'extension .${ext}.`);
    }
}
//# sourceMappingURL=file-validator.js.map