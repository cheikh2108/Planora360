"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const prisma_module_1 = require("./common/prisma/prisma.module");
const audit_module_1 = require("./audit/audit.module");
const security_events_module_1 = require("./security-events/security-events.module");
const notifications_module_1 = require("./notifications/notifications.module");
const storage_module_1 = require("./storage/storage.module");
const auth_module_1 = require("./auth/auth.module");
const organizations_module_1 = require("./organizations/organizations.module");
const users_module_1 = require("./users/users.module");
const action_plans_module_1 = require("./action-plans/action-plans.module");
const activities_module_1 = require("./activities/activities.module");
const checklist_module_1 = require("./checklist/checklist.module");
const documents_module_1 = require("./documents/documents.module");
const validations_module_1 = require("./validations/validations.module");
const budgets_module_1 = require("./budgets/budgets.module");
const dashboards_module_1 = require("./dashboards/dashboards.module");
const scheduler_module_1 = require("./scheduler/scheduler.module");
const reports_module_1 = require("./reports/reports.module");
const roles_module_1 = require("./roles/roles.module");
const indicators_module_1 = require("./indicators/indicators.module");
const participants_module_1 = require("./participants/participants.module");
const capitalization_module_1 = require("./capitalization/capitalization.module");
const planning_module_1 = require("./planning/planning.module");
const recommendations_module_1 = require("./recommendations/recommendations.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            schedule_1.ScheduleModule.forRoot(),
            throttler_1.ThrottlerModule.forRoot([{
                    ttl: 60000,
                    limit: 100,
                }]),
            prisma_module_1.PrismaModule,
            audit_module_1.AuditModule,
            security_events_module_1.SecurityEventsModule,
            notifications_module_1.NotificationsModule,
            storage_module_1.StorageModule,
            auth_module_1.AuthModule,
            organizations_module_1.OrganizationsModule,
            users_module_1.UsersModule,
            action_plans_module_1.ActionPlansModule,
            activities_module_1.ActivitiesModule,
            checklist_module_1.ChecklistModule,
            documents_module_1.DocumentsModule,
            validations_module_1.ValidationsModule,
            budgets_module_1.BudgetsModule,
            dashboards_module_1.DashboardsModule,
            scheduler_module_1.SchedulerModule,
            reports_module_1.ReportsModule,
            roles_module_1.RolesModule,
            indicators_module_1.IndicatorsModule,
            participants_module_1.ParticipantsModule,
            capitalization_module_1.CapitalizationModule,
            planning_module_1.PlanningModule,
            recommendations_module_1.RecommendationsModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map