// Utilisé par DemandesController (PATCH /passation/demandes/:id). Le statut ne change que par le workflow.
import { PartialType } from '@nestjs/mapped-types';
import { CreateDemandeDto } from './create-demande.dto';

export class UpdateDemandeDto extends PartialType(CreateDemandeDto) {}
