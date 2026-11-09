import { IsEmail, IsIn, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
import { SubscriptionPlan } from '@prisma/client';

export class RequestQuoteDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  organization: string;

  @IsIn(Object.values(SubscriptionPlan))
  plan: string;

  @IsOptional()
  @IsIn(['MONTHLY', 'YEARLY'])
  billingCycle?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(150)
  fullName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  estimatedUsers?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;
}
