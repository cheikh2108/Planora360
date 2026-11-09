// Utilisé par ProceduresController (PATCH /passation/procedures/:id)
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { StatusProcedure } from '@prisma/client';
import { CreateProcedureDto } from './create-procedure.dto';

export class UpdateProcedureDto extends PartialType(CreateProcedureDto) {
  /** Changement de statut manuel : seules les transitions autorisées sont acceptées (voir ProceduresService). */
  @IsOptional()
  @IsEnum(StatusProcedure, { message: 'Statut de procédure invalide' })
  status?: StatusProcedure;
}
