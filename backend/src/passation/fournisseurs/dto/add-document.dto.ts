// Utilisé par FournisseursController (POST /passation/fournisseurs/:id/documents)
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class AddFournisseurDocumentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  type: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nom: string;

  /** Lien http(s) vers le document (pas de javascript:, data:, etc.). */
  @IsUrl(
    { protocols: ['http', 'https'], require_protocol: true },
    { message: 'URL de document invalide' },
  )
  url: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  fileSize?: number;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsDateString()
  dateExpiration?: string;
}
