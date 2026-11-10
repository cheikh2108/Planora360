"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nextReferenceFrom = nextReferenceFrom;
exports.isUniqueViolation = isUniqueViolation;
exports.createWithReference = createWithReference;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
function nextReferenceFrom(existing, prefix, pad) {
    let max = 0;
    for (const ref of existing) {
        if (!ref?.startsWith(prefix))
            continue;
        const n = parseInt(ref.slice(prefix.length), 10);
        if (Number.isFinite(n) && n > max)
            max = n;
    }
    return `${prefix}${String(max + 1).padStart(pad, '0')}`;
}
function isUniqueViolation(error) {
    return error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}
async function createWithReference(computeReference, create, attempts = 5) {
    for (let i = 0; i < attempts; i++) {
        const reference = await computeReference();
        try {
            return await create(reference);
        }
        catch (error) {
            if (!isUniqueViolation(error) || i === attempts - 1)
                throw error;
        }
    }
    throw new common_1.ConflictException('Impossible de générer une référence unique, réessayez.');
}
//# sourceMappingURL=reference.js.map