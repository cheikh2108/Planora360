"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateFournisseurDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_fournisseur_dto_1 = require("./create-fournisseur.dto");
class UpdateFournisseurDto extends (0, mapped_types_1.PartialType)(create_fournisseur_dto_1.CreateFournisseurDto) {
}
exports.UpdateFournisseurDto = UpdateFournisseurDto;
//# sourceMappingURL=update-fournisseur.dto.js.map