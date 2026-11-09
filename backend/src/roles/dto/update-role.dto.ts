import { IsString, IsArray, IsOptional, MinLength, ArrayUnique, IsIn } from 'class-validator';
import { PERMISSIONS } from '../../common/constants/permissions.constants';

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsIn(PERMISSIONS as unknown as string[], { each: true, message: 'Permission inconnue : $value' })
  permissions?: string[];
}
