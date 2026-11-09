"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertSessionAllowed = assertSessionAllowed;
exports.loadSessionUser = loadSessionUser;
exports.assertTokenNotRevoked = assertTokenNotRevoked;
exports.assertSessionActive = assertSessionActive;
const common_1 = require("@nestjs/common");
const auth_constants_1 = require("../constants/auth.constants");
const roles_guard_1 = require("../guards/roles.guard");
const BLOCKED_STATUSES = {
    PENDING: auth_constants_1.ERROR_REGISTRATION_PENDING,
    PENDING_APPROVAL: auth_constants_1.ERROR_REGISTRATION_PENDING,
    REJECTED: auth_constants_1.ERROR_REGISTRATION_REJECTED,
    SUSPENDED: auth_constants_1.ERROR_ORGANIZATION_SUSPENDED,
};
function assertSessionAllowed(user) {
    if (!user || !user.isActive || user.deletedAt) {
        throw new common_1.UnauthorizedException(auth_constants_1.ERROR_INVALID_CREDENTIALS);
    }
    if ((0, roles_guard_1.isSuperAdmin)(user))
        return;
    const org = user.organization;
    if (!org || org.deletedAt) {
        throw new common_1.UnauthorizedException(auth_constants_1.ERROR_INVALID_CREDENTIALS);
    }
    const blocked = BLOCKED_STATUSES[org.status];
    if (blocked) {
        throw new common_1.UnauthorizedException(blocked);
    }
}
async function loadSessionUser(prisma, userId) {
    if (!userId || typeof userId !== 'string')
        throw new common_1.UnauthorizedException();
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true, organization: true },
    });
    assertSessionAllowed(user);
    return user;
}
function assertTokenNotRevoked(user, payload) {
    if (!user.tokensValidAfter)
        return;
    const issuedAt = typeof payload?.iatMs === 'number' ? payload.iatMs : (payload?.iat ?? 0) * 1000;
    if (issuedAt < user.tokensValidAfter.getTime()) {
        throw new common_1.UnauthorizedException('Session expirée');
    }
}
async function assertSessionActive(prisma, payload) {
    if (!payload?.sid)
        return;
    const session = await prisma.refreshToken.findUnique({ where: { id: payload.sid }, select: { id: true } });
    if (!session)
        throw new common_1.UnauthorizedException('Session expirée');
}
//# sourceMappingURL=session-policy.js.map