"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateActionPlanDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_action_plan_dto_1 = require("./create-action-plan.dto");
class UpdateActionPlanDto extends (0, mapped_types_1.PartialType)(create_action_plan_dto_1.CreateActionPlanDto) {
}
exports.UpdateActionPlanDto = UpdateActionPlanDto;
//# sourceMappingURL=update-action-plan.dto.js.map