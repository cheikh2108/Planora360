import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  @IsBoolean()
  isImportant?: boolean;
}
