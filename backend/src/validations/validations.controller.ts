import {
  Controller, Get, Post, Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ValidationsService } from './validations.service';
import { TransitionDto } from './dto/transition.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class ValidationsController {
  constructor(private validationsService: ValidationsService) {}

  // Soumettre une activité pour validation (resp_activite uniquement)
  @Post('activities/:activityId/submit')
  @HttpCode(HttpStatus.CREATED)
  submit(@Param('activityId') activityId: string, @CurrentUser() user: any) {
    return this.validationsService.submit(activityId, user.id, user.organizationId);
  }

  // Effectuer une transition (approuver ou rejeter)
  @Post('activities/:activityId/validate')
  @HttpCode(HttpStatus.CREATED)
  transition(
    @Param('activityId') activityId: string,
    @Body() dto: TransitionDto,
    @CurrentUser() user: any,
  ) {
    return this.validationsService.transition(activityId, dto, user.id, user.organizationId);
  }

  // Historique de validation d'une activité
  @Get('activities/:activityId/validations')
  getHistory(@Param('activityId') activityId: string, @CurrentUser() user: any) {
    return this.validationsService.getHistory(activityId, user.organizationId);
  }

  // Étape courante d'une activité
  @Get('activities/:activityId/validations/current')
  getCurrentStep(@Param('activityId') activityId: string, @CurrentUser() user: any) {
    return this.validationsService.getCurrentStep(activityId, user.organizationId);
  }

  // File des activités en attente de validation pour l'utilisateur connecté
  @Get('validations/pending')
  getPending(@CurrentUser() user: any) {
    return this.validationsService.findPending(user.id, user.organizationId);
  }
}
