// Utilisé par ContratsController (PATCH /passation/contrats/:id).
// Le statut change par les actions dédiées (suspend/terminate/close), le montant payé par les paiements.
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateContratDto {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  montantRevise?: number;

  @IsOptional()
  @IsIn(['XOF', 'XAF', 'GNF', 'EUR', 'USD'])
  devise?: string;

  @IsOptional()
  @IsDateString()
  dateDemarrage?: string;

  @IsOptional()
  @IsDateString()
  dateEcheance?: string;

  @IsOptional()
  @IsDateString()
  dateReceptionProv?: string;

  @IsOptional()
  @IsDateString()
  dateReceptionDef?: string;

  @IsOptional()
  @IsString()
  modalitesAvance?: string;

  @IsOptional()
  @IsString()
  modalitesAcompte?: string;

  @IsOptional()
  @IsString()
  modalitesRetenue?: string;

  @IsOptional()
  @IsString()
  garanties?: string;
}
