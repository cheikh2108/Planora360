import { IsString, IsOptional, IsObject, IsIn } from 'class-validator';
import { ZONE_PRESET_LIST, ZonePreset } from '../constants/zone-presets';

export class UpdateZoneConfigDto {
  @IsOptional()
  @IsString()
  @IsIn(ZONE_PRESET_LIST, {
    message: `Le preset doit être l'un de: ${ZONE_PRESET_LIST.join(', ')}`,
  })
  preset?: ZonePreset;

  @IsOptional()
  @IsObject()
  levelLabels?: Record<string, string>;

  @IsOptional()
  @IsString()
  description?: string;
}
