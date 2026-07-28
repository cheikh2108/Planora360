import { IsString, IsOptional, IsEnum, MinLength } from 'class-validator';
import { SubscriptionPlan } from '@prisma/client';

export class CreateOrganizationDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsEnum(SubscriptionPlan)
  subscriptionPlan?: SubscriptionPlan;
}
