import { IsString, IsArray, MinLength, ArrayUnique } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsArray()
  @ArrayUnique()
  permissions: string[];
}
