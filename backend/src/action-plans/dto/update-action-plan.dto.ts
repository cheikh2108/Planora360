import { PartialType } from '@nestjs/mapped-types';
import { CreateActionPlanDto } from './create-action-plan.dto';

export class UpdateActionPlanDto extends PartialType(CreateActionPlanDto) {}
