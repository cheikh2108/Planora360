import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsString()
  roleId: string;

  @IsOptional()
  @IsString()
  organizationId?: string;
}
