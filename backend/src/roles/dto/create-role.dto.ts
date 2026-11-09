import { IsString, IsArray, MinLength, ArrayUnique, IsIn } from 'class-validator';
import { PERMISSIONS } from '../../common/constants/permissions.constants';

export class CreateRoleDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsArray()
  @ArrayUnique()
  @IsIn(PERMISSIONS as unknown as string[], { each: true, message: 'Permission inconnue : $value' })
  permissions: string[];
}
