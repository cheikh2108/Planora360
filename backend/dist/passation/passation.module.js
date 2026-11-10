"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PassationModule = void 0;
const common_1 = require("@nestjs/common");
const ppm_module_1 = require("./ppm/ppm.module");
const demandes_module_1 = require("./demandes/demandes.module");
const fournisseurs_module_1 = require("./fournisseurs/fournisseurs.module");
const procedures_module_1 = require("./procedures/procedures.module");
const soumissions_module_1 = require("./soumissions/soumissions.module");
const commissions_module_1 = require("./commissions/commissions.module");
const evaluations_module_1 = require("./evaluations/evaluations.module");
const contrats_module_1 = require("./contrats/contrats.module");
let PassationModule = class PassationModule {
};
exports.PassationModule = PassationModule;
exports.PassationModule = PassationModule = __decorate([
    (0, common_1.Module)({
        imports: [
            ppm_module_1.PpmModule,
            demandes_module_1.DemandesModule,
            fournisseurs_module_1.FournisseursModule,
            procedures_module_1.ProceduresModule,
            soumissions_module_1.SoumissionsModule,
            commissions_module_1.CommissionsModule,
            evaluations_module_1.EvaluationsModule,
            contrats_module_1.ContratsModule,
        ],
        exports: [
            ppm_module_1.PpmModule,
            demandes_module_1.DemandesModule,
            fournisseurs_module_1.FournisseursModule,
            procedures_module_1.ProceduresModule,
            soumissions_module_1.SoumissionsModule,
            commissions_module_1.CommissionsModule,
            evaluations_module_1.EvaluationsModule,
            contrats_module_1.ContratsModule,
        ],
    })
], PassationModule);
//# sourceMappingURL=passation.module.js.map