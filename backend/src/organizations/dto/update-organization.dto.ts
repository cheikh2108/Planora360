import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { SubscriptionPlan } from '@prisma/client';

/**
 * Champs modifiables d'une organisation par le super admin.
 * (Avant : PartialType(CreateOrganizationDto) laissait passer adminEmail/adminFirstName…,
 * qui n'existent pas sur Organization → erreur Prisma 500.)
 */
export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;

  @IsOptional()
  @IsEnum(SubscriptionPlan)
  subscriptionPlan?: SubscriptionPlan;
}
