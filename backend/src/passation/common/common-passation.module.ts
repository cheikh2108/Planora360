import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { ValidationWorkflowService } from './services/validation-workflow.service';
import { SoumissionConfidentialityGuard } from './guards/soumission-confidentiality.guard';

/**
 * Module commun pour les fonctionnalités partagées de Passation
 *
 * Ce module centralise les services, guards et utilitaires partagés
 * entre les différents sous-modules de Passation (PPM, Demandes, etc.)
 */
@Module({
  imports: [PrismaModule],
  providers: [ValidationWorkflowService, SoumissionConfidentialityGuard],
  exports: [ValidationWorkflowService, SoumissionConfidentialityGuard],
})
export class CommonPassationModule {}
