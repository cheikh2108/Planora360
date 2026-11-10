"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePpmDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_ppm_dto_1 = require("./create-ppm.dto");
class UpdatePpmDto extends (0, mapped_types_1.PartialType)(create_ppm_dto_1.CreatePpmDto) {
}
exports.UpdatePpmDto = UpdatePpmDto;
//# sourceMappingURL=update-ppm.dto.js.map