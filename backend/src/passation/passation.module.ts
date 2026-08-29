import { Module } from '@nestjs/common';
import { PpmModule } from './ppm/ppm.module';
import { DemandesModule } from './demandes/demandes.module';
import { FournisseursModule } from './fournisseurs/fournisseurs.module';
import { ProceduresModule } from './procedures/procedures.module';
import { SoumissionsModule } from './soumissions/soumissions.module';
import { CommissionsModule } from './commissions/commissions.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { ContratsModule } from './contrats/contrats.module';

@Module({
  imports: [
    PpmModule,
    DemandesModule,
    FournisseursModule,
    ProceduresModule,
    SoumissionsModule,
    CommissionsModule,
    EvaluationsModule,
    ContratsModule,
  ],
  exports: [
    PpmModule,
    DemandesModule,
    FournisseursModule,
    ProceduresModule,
    SoumissionsModule,
    CommissionsModule,
    EvaluationsModule,
    ContratsModule,
  ],
})
export class PassationModule {}
