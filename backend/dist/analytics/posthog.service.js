"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PostHogService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostHogService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const posthog_node_1 = require("posthog-node");
let PostHogService = PostHogService_1 = class PostHogService {
    config;
    logger = new common_1.Logger(PostHogService_1.name);
    client = null;
    enabled = false;
    constructor(config) {
        this.config = config;
        const apiKey = this.config.get('POSTHOG_KEY');
        const host = this.config.get('POSTHOG_HOST');
        if (apiKey && host) {
            this.client = new posthog_node_1.PostHog(apiKey, { host });
            this.enabled = true;
            this.logger.log('PostHog Analytics activé');
        }
        else {
            this.logger.warn('PostHog Analytics désactivé (variables d\'environnement manquantes)');
        }
    }
    async onModuleDestroy() {
        if (this.client) {
            await this.client.shutdown();
        }
    }
    capture(distinctId, event, properties) {
        if (!this.enabled || !this.client)
            return;
        try {
            this.client.capture({
                distinctId,
                event,
                properties,
            });
        }
        catch (error) {
            this.logger.error(`Erreur PostHog capture: ${error.message}`);
        }
    }
    identify(distinctId, properties) {
        if (!this.enabled || !this.client)
            return;
        try {
            this.client.identify({
                distinctId,
                properties,
            });
        }
        catch (error) {
            this.logger.error(`Erreur PostHog identify: ${error.message}`);
        }
    }
    alias(distinctId, alias) {
        if (!this.enabled || !this.client)
            return;
        try {
            this.client.alias({
                distinctId,
                alias,
            });
        }
        catch (error) {
            this.logger.error(`Erreur PostHog alias: ${error.message}`);
        }
    }
    trackLogin(userId, email, organizationId) {
        this.capture(userId, 'user_logged_in', {
            email,
            organizationId,
            timestamp: new Date().toISOString(),
        });
    }
    trackLogout(userId) {
        this.capture(userId, 'user_logged_out', {
            timestamp: new Date().toISOString(),
        });
    }
    trackRegistration(userId, organizationId, subscriptionPlan) {
        this.capture(userId, 'organization_registered', {
            organizationId,
            subscriptionPlan,
            timestamp: new Date().toISOString(),
        });
    }
    trackActionPlanCreated(userId, planId, organizationId) {
        this.capture(userId, 'action_plan_created', {
            planId,
            organizationId,
            timestamp: new Date().toISOString(),
        });
    }
    trackActivityCreated(userId, activityId, planId, organizationId) {
        this.capture(userId, 'activity_created', {
            activityId,
            planId,
            organizationId,
            timestamp: new Date().toISOString(),
        });
    }
    trackActivitySubmitted(userId, activityId, organizationId) {
        this.capture(userId, 'activity_submitted', {
            activityId,
            organizationId,
            timestamp: new Date().toISOString(),
        });
    }
    trackActivityValidated(userId, activityId, approved, organizationId) {
        this.capture(userId, 'activity_validated', {
            activityId,
            approved,
            organizationId,
            timestamp: new Date().toISOString(),
        });
    }
    trackDocumentUploaded(userId, documentId, fileSize, organizationId) {
        this.capture(userId, 'document_uploaded', {
            documentId,
            fileSize,
            organizationId,
            timestamp: new Date().toISOString(),
        });
    }
};
exports.PostHogService = PostHogService;
exports.PostHogService = PostHogService = PostHogService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PostHogService);
//# sourceMappingURL=posthog.service.js.map