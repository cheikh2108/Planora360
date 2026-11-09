import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { CreateRecommendationDto } from './dto/create-recommendation.dto';
import { UpdateRecommendationDto } from './dto/update-recommendation.dto';
import {
  ChangeStatusDto,
  SuspendRecommendationDto,
  ReopenRecommendationDto,
} from './dto/change-status.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateActionDto } from './dto/create-action.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SubscriptionGuard, RequiresPlan } from '../common/guards/subscription.guard';
import { SubscriptionPlan } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateActionDto } from './dto/update-action.dto';

@Controller('recommendations')
@UseGuards(JwtAuthGuard, RolesGuard, SubscriptionGuard)
@RequiresPlan(SubscriptionPlan.EQUIPE, SubscriptionPlan.ORGANISATION, SubscriptionPlan.ENTERPRISE)
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Post()
  @Roles('Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service')
  create(@Body() dto: CreateRecommendationDto, @CurrentUser() user: any) {
    return this.recommendationsService.create(dto, user.organizationId, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: any, @Query() filters: any) {
    return this.recommendationsService.findAll(user.organizationId, filters);
  }

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.recommendationsService.getStats(user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.recommendationsService.findOne(id, user.organizationId);
  }

  @Patch(':id')
  @Roles('Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRecommendationDto,
    @CurrentUser() user: any,
  ) {
    return this.recommendationsService.update(id, dto, user.organizationId, user.id);
  }

  @Patch(':id/status')
  @Roles('Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service')
  changeStatus(
    @Param('id') id: string,
    @Body() dto: ChangeStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.recommendationsService.changeStatus(id, dto, user.organizationId, user.id);
  }

  @Post(':id/suspend')
  @Roles('Administrateur', 'Coordinateur', 'Responsable de projet')
  suspend(
    @Param('id') id: string,
    @Body() dto: SuspendRecommendationDto,
    @CurrentUser() user: any,
  ) {
    return this.recommendationsService.suspend(id, dto, user.organizationId, user.id);
  }

  @Post(':id/reopen')
  @Roles('Administrateur', 'Coordinateur')
  reopen(
    @Param('id') id: string,
    @Body() dto: ReopenRecommendationDto,
    @CurrentUser() user: any,
  ) {
    return this.recommendationsService.reopen(id, dto, user.organizationId, user.id);
  }

  @Delete(':id')
  @Roles('Administrateur', 'Coordinateur')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.recommendationsService.delete(id, user.organizationId, user.id);
  }

  // Actions
  @Post(':id/actions')
  @Roles('Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service')
  addAction(
    @Param('id') id: string,
    @Body() dto: CreateActionDto,
    @CurrentUser() user: any,
  ) {
    return this.recommendationsService.addAction(id, dto, user.organizationId, user.id);
  }

  @Patch('actions/:actionId')
  @Roles('Administrateur', 'Coordinateur', 'Responsable de projet', 'Chef de service')
  updateAction(
    @Param('actionId') actionId: string,
    @Body() updates: UpdateActionDto,
    @CurrentUser() user: any,
  ) {
    return this.recommendationsService.updateAction(actionId, user.organizationId, updates);
  }

  @Delete('actions/:actionId')
  @Roles('Administrateur', 'Coordinateur', 'Responsable de projet')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAction(@Param('actionId') actionId: string, @CurrentUser() user: any) {
    return this.recommendationsService.deleteAction(actionId, user.organizationId, user.id);
  }

  // Commentaires
  @Post(':id/comments')
  addComment(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: any,
  ) {
    return this.recommendationsService.addComment(id, dto, user.organizationId, user.id);
  }

  @Get(':id/comments')
  getComments(@Param('id') id: string, @CurrentUser() user: any) {
    return this.recommendationsService.getComments(id, user.organizationId);
  }
}
