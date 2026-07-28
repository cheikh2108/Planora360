import { Module } from '@nestjs/common';
import { ActionPlansService } from './action-plans.service';
import { ActionPlansController } from './action-plans.controller';

@Module({
  controllers: [ActionPlansController],
  providers: [ActionPlansService],
  exports: [ActionPlansService],
})
export class ActionPlansModule {}
