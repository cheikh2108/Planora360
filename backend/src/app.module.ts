import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuditModule } from './audit/audit.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { UsersModule } from './users/users.module';
import { ActionPlansModule } from './action-plans/action-plans.module';
import { ActivitiesModule } from './activities/activities.module';
import { ChecklistModule } from './checklist/checklist.module';
import { DocumentsModule } from './documents/documents.module';
import { ValidationsModule } from './validations/validations.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuditModule,
    NotificationsModule,
    AuthModule,
    OrganizationsModule,
    UsersModule,
    ActionPlansModule,
    ActivitiesModule,
    ChecklistModule,
    DocumentsModule,
    ValidationsModule,
  ],
})
export class AppModule {}
