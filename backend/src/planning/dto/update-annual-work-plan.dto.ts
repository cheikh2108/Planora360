import { PartialType } from '@nestjs/mapped-types';
import { CreateAnnualWorkPlanDto } from './create-annual-work-plan.dto';

export class UpdateAnnualWorkPlanDto extends PartialType(CreateAnnualWorkPlanDto) {}
