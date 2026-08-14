"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCapitalizationDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_capitalization_dto_1 = require("./create-capitalization.dto");
class UpdateCapitalizationDto extends (0, mapped_types_1.PartialType)(create_capitalization_dto_1.CreateCapitalizationDto) {
}
exports.UpdateCapitalizationDto = UpdateCapitalizationDto;
//# sourceMappingURL=update-capitalization.dto.js.map