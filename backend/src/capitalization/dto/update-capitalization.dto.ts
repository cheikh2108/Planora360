import { PartialType } from '@nestjs/mapped-types';
import { CreateCapitalizationDto } from './create-capitalization.dto';

export class UpdateCapitalizationDto extends PartialType(CreateCapitalizationDto) {}
