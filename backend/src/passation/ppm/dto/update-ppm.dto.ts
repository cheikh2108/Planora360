import { PartialType } from '@nestjs/mapped-types';
import { CreatePpmDto } from './create-ppm.dto';

export class UpdatePpmDto extends PartialType(CreatePpmDto) {}
