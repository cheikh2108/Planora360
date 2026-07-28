import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuditModule } from './audit/audit.module';
import { NotificationsModule } from './notifications/notifications.module';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { UsersModule } from './users/users.module';
import { ActionPlansModule } from './action-plans/action-plans.module';
import { ActivitiesModule } from './activities/activities.module';
import { ChecklistModule } from './checklist/checklist.module';
import { DocumentsModule } from './documents/documents.module';
import { ValidationsModule } from './validations/validations.module';
import { BudgetsModule } from './budgets/budgets.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuditModule,
    NotificationsModule,
    StorageModule,
    AuthModule,
    OrganizationsModule,
    UsersModule,
    ActionPlansModule,
    ActivitiesModule,
    ChecklistModule,
    DocumentsModule,
    ValidationsModule,
    BudgetsModule,
    DashboardsModule,
    SchedulerModule,
    ReportsModule,
  ],
})
export class AppModule {}
