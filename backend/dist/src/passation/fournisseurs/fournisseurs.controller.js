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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FournisseursController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const fournisseurs_service_1 = require("./fournisseurs.service");
const create_fournisseur_dto_1 = require("./dto/create-fournisseur.dto");
const update_fournisseur_dto_1 = require("./dto/update-fournisseur.dto");
const client_1 = require("@prisma/client");
let FournisseursController = class FournisseursController {
    fournisseursService;
    constructor(fournisseursService) {
        this.fournisseursService = fournisseursService;
    }
    create(req, createFournisseurDto) {
        return this.fournisseursService.create(req.user.organizationId, createFournisseurDto);
    }
    findAll(req, status, search) {
        return this.fournisseursService.findAll(req.user.organizationId, {
            status,
            search,
        });
    }
    findOne(id, req) {
        return this.fournisseursService.findOne(id, req.user.organizationId);
    }
    update(id, req, updateFournisseurDto) {
        return this.fournisseursService.update(id, req.user.organizationId, updateFournisseurDto);
    }
    remove(id, req) {
        return this.fournisseursService.remove(id, req.user.organizationId);
    }
    suspend(id, req, motif) {
        return this.fournisseursService.changeStatus(id, req.user.organizationId, client_1.StatusFournisseur.SUSPENDU, motif);
    }
    blacklist(id, req, motif) {
        return this.fournisseursService.changeStatus(id, req.user.organizationId, client_1.StatusFournisseur.BLACKLISTE, motif);
    }
    activate(id, req) {
        return this.fournisseursService.changeStatus(id, req.user.organizationId, client_1.StatusFournisseur.ACTIF);
    }
    getDocuments(id, req) {
        return this.fournisseursService.findOne(id, req.user.organizationId);
    }
    addDocument(id, req, documentData) {
        return this.fournisseursService.addDocument(id, req.user.organizationId, documentData);
    }
    removeDocument(id, docId, req) {
        return this.fournisseursService.removeDocument(id, docId, req.user.organizationId);
    }
};
exports.FournisseursController = FournisseursController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_fournisseur_dto_1.CreateFournisseurDto]),
    __metadata("design:returntype", void 0)
], FournisseursController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], FournisseursController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FournisseursController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_fournisseur_dto_1.UpdateFournisseurDto]),
    __metadata("design:returntype", void 0)
], FournisseursController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FournisseursController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/suspend'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)('motif')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], FournisseursController.prototype, "suspend", null);
__decorate([
    (0, common_1.Post)(':id/blacklist'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)('motif')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", void 0)
], FournisseursController.prototype, "blacklist", null);
__decorate([
    (0, common_1.Post)(':id/activate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FournisseursController.prototype, "activate", null);
__decorate([
    (0, common_1.Get)(':id/documents'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FournisseursController.prototype, "getDocuments", null);
__decorate([
    (0, common_1.Post)(':id/documents'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], FournisseursController.prototype, "addDocument", null);
__decorate([
    (0, common_1.Delete)(':id/documents/:docId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('docId')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], FournisseursController.prototype, "removeDocument", null);
exports.FournisseursController = FournisseursController = __decorate([
    (0, common_1.Controller)('passation/fournisseurs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [fournisseurs_service_1.FournisseursService])
], FournisseursController);
//# sourceMappingURL=fournisseurs.controller.js.map