import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostHog } from 'posthog-node';

@Injectable()
export class PostHogService implements OnModuleDestroy {
  private readonly logger = new Logger(PostHogService.name);
  private client: PostHog | null = null;
  private enabled: boolean = false;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('POSTHOG_KEY');
    const host = this.config.get<string>('POSTHOG_HOST');

    if (apiKey && host) {
      this.client = new PostHog(apiKey, { host });
      this.enabled = true;
      this.logger.log('PostHog Analytics activé');
    } else {
      this.logger.warn('PostHog Analytics désactivé (variables d\'environnement manquantes)');
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.shutdown();
    }
  }

  /**
   * Capture un événement générique
   */
  capture(distinctId: string, event: string, properties?: Record<string, any>) {
    if (!this.enabled || !this.client) return;

    try {
      this.client.capture({
        distinctId,
        event,
        properties,
      });
    } catch (error) {
      this.logger.error(`Erreur PostHog capture: ${error.message}`);
    }
  }

  /**
   * Identifie un utilisateur
   */
  identify(distinctId: string, properties: Record<string, any>) {
    if (!this.enabled || !this.client) return;

    try {
      this.client.identify({
        distinctId,
        properties,
      });
    } catch (error) {
      this.logger.error(`Erreur PostHog identify: ${error.message}`);
    }
  }

  /**
   * Alias un utilisateur (lie ancien ID à nouveau ID)
   */
  alias(distinctId: string, alias: string) {
    if (!this.enabled || !this.client) return;

    try {
      this.client.alias({
        distinctId,
        alias,
      });
    } catch (error) {
      this.logger.error(`Erreur PostHog alias: ${error.message}`);
    }
  }

  // === Événements métier spécifiques ===

  /**
   * Connexion utilisateur
   */
  trackLogin(userId: string, email: string, organizationId?: string) {
    this.capture(userId, 'user_logged_in', {
      email,
      organizationId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Déconnexion utilisateur
   */
  trackLogout(userId: string) {
    this.capture(userId, 'user_logged_out', {
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Inscription organisation
   */
  trackRegistration(userId: string, organizationId: string, subscriptionPlan: string) {
    this.capture(userId, 'organization_registered', {
      organizationId,
      subscriptionPlan,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Création plan d'action
   */
  trackActionPlanCreated(userId: string, planId: string, organizationId: string) {
    this.capture(userId, 'action_plan_created', {
      planId,
      organizationId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Création activité
   */
  trackActivityCreated(
    userId: string,
    activityId: string,
    planId: string,
    organizationId: string,
  ) {
    this.capture(userId, 'activity_created', {
      activityId,
      planId,
      organizationId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Soumission activité
   */
  trackActivitySubmitted(
    userId: string,
    activityId: string,
    organizationId: string,
  ) {
    this.capture(userId, 'activity_submitted', {
      activityId,
      organizationId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Validation activité
   */
  trackActivityValidated(
    userId: string,
    activityId: string,
    approved: boolean,
    organizationId: string,
  ) {
    this.capture(userId, 'activity_validated', {
      activityId,
      approved,
      organizationId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Upload document
   */
  trackDocumentUploaded(
    userId: string,
    documentId: string,
    fileSize: number,
    organizationId: string,
  ) {
    this.capture(userId, 'document_uploaded', {
      documentId,
      fileSize,
      organizationId,
      timestamp: new Date().toISOString(),
    });
  }
}
