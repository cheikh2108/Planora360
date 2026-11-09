import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { BillingCycle } from '@prisma/client';
import { IsEnum, IsIn } from 'class-validator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BillingService } from './billing.service';
import { PAYABLE_PLANS, PayablePlan } from './plan-catalog';

export class StartCheckoutDto {
  @IsIn(PAYABLE_PLANS as unknown as string[], { message: 'Formule non disponible en paiement en ligne' })
  plan: PayablePlan;

  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;
}

/** Formules, abonnement de l'organisation et démarrage d'un paiement DexPay. */
@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billing: BillingService) {}

  /** Catalogue des formules et prix (XOF). */
  @Get('plans')
  plans() {
    return this.billing.plans();
  }

  /** Abonnement en cours et historique des paiements de l'organisation. */
  @Get('subscription')
  @UseGuards(RolesGuard)
  @Roles('Administrateur')
  subscription(@CurrentUser() user: any) {
    return this.billing.subscription(user.organizationId);
  }

  /** Démarre le paiement d'une formule : renvoie l'URL de la page de paiement DexPay. */
  @Post('checkout')
  @UseGuards(RolesGuard)
  @Roles('Administrateur')
  checkout(@CurrentUser() user: any, @Body() dto: StartCheckoutDto) {
    return this.billing.startCheckout(user.organizationId, user.id, dto.plan, dto.billingCycle);
  }
}
