import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { UsersModule } from './users/users.module';
import { ActionPlansModule } from './action-plans/action-plans.module';
import { ActivitiesModule } from './activities/activities.module';
import { ChecklistModule } from './checklist/checklist.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    OrganizationsModule,
    UsersModule,
    ActionPlansModule,
    ActivitiesModule,
    ChecklistModule,
    DocumentsModule,
  ],
})
export class AppModule {}
