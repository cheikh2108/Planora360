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
exports.FIELD_WRITERS = exports.ZONE_WRITERS = exports.PLANNING_WRITERS = exports.PASSATION_WRITERS = exports.WriteRolesGuard = void 0;
exports.WriteRoles = WriteRoles;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const roles_guard_1 = require("./roles.guard");
const WRITE_ROLES_KEY = 'writeRoles';
function WriteRoles(options) {
    return (0, common_1.applyDecorators)((0, common_1.SetMetadata)(WRITE_ROLES_KEY, options), (0, common_1.UseGuards)(WriteRolesGuard));
}
let WriteRolesGuard = class WriteRolesGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const options = this.reflector.getAllAndOverride(WRITE_ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!options)
            return true;
        const request = context.switchToHttp().getRequest();
        if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method))
            return true;
        const user = request.user;
        if (!user)
            throw new common_1.ForbiddenException('Accès refusé. Veuillez vous reconnecter.');
        if ((0, roles_guard_1.isSuperAdmin)(user))
            return true;
        const roleName = (0, roles_guard_1.systemRoleName)(user);
        if (roleName && options.roles.includes(roleName))
            return true;
        const permissions = Array.isArray(user.role?.permissions) ? user.role.permissions : [];
        if (!roleName && options.permission && permissions.includes(options.permission))
            return true;
        throw new common_1.ForbiddenException(`Cette action est réservée aux rôles suivants : ${options.roles.join(', ')}. ` +
            'Contactez votre administrateur pour obtenir les autorisations nécessaires.');
    }
};
exports.WriteRolesGuard = WriteRolesGuard;
exports.WriteRolesGuard = WriteRolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], WriteRolesGuard);
exports.PASSATION_WRITERS = ['Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service', 'Responsable financier'];
exports.PLANNING_WRITERS = ['Administrateur', 'Coordinateur', 'Responsable de projet'];
exports.ZONE_WRITERS = ['Administrateur', 'Coordinateur'];
exports.FIELD_WRITERS = ['Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service', "Responsable d'activité"];
//# sourceMappingURL=write-roles.guard.js.map