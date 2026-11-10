"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDemandeDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_demande_dto_1 = require("./create-demande.dto");
class UpdateDemandeDto extends (0, mapped_types_1.PartialType)(create_demande_dto_1.CreateDemandeDto) {
}
exports.UpdateDemandeDto = UpdateDemandeDto;
//# sourceMappingURL=update-demande.dto.js.map