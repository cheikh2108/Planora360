"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateIndicatorDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_indicator_dto_1 = require("./create-indicator.dto");
class UpdateIndicatorDto extends (0, mapped_types_1.PartialType)(create_indicator_dto_1.CreateIndicatorDto) {
}
exports.UpdateIndicatorDto = UpdateIndicatorDto;
//# sourceMappingURL=update-indicator.dto.js.map