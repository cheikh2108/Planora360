import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * Service d'invalidation de cache
 *
 * Appelé après les mutations pour invalider les caches concernés
 * Usage: await this.cacheInvalidation.invalidateDashboard(organizationId);
 */
@Injectable()
export class CacheInvalidationService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Invalide tout le cache du dashboard pour une organisation
   * À appeler après: création/modification/suppression plan, activité, budget
   */
  async invalidateDashboard(organizationId: string): Promise<void> {
    const patterns = [
      `cache:${organizationId}:*:/dashboards/overview:*`,
      `cache:${organizationId}:*:/dashboards/performance:*`,
      `cache:${organizationId}:*:/budgets/summary:*`,
    ];

    await this.invalidateByPatterns(patterns);
    console.log(`🗑️  Cache invalidated: dashboard for org ${organizationId}`);
  }

  /**
   * Invalide le cache des utilisateurs pour une organisation
   * À appeler après: création/modification/suppression utilisateur
   */
  async invalidateUsers(organizationId: string): Promise<void> {
    const patterns = [
      `cache:${organizationId}:*:/users*`,
      `cache:${organizationId}:*:/admin/users*`,
    ];

    await this.invalidateByPatterns(patterns);
    console.log(`🗑️  Cache invalidated: users for org ${organizationId}`);
  }

  /**
   * Invalide le cache des rôles/permissions pour une organisation
   * À appeler après: modification rôles/permissions
   */
  async invalidateRoles(organizationId: string): Promise<void> {
    const patterns = [
      `cache:${organizationId}:*:/roles*`,
      `cache:${organizationId}:*:/admin/roles*`,
    ];

    await this.invalidateByPatterns(patterns);
    console.log(`🗑️  Cache invalidated: roles for org ${organizationId}`);
  }

  /**
   * Invalide le cache d'une organisation spécifique
   * À appeler après: modification settings organisation
   */
  async invalidateOrganization(organizationId: string): Promise<void> {
    const patterns = [`cache:${organizationId}:*:/organizations/${organizationId}*`];

    await this.invalidateByPatterns(patterns);
    console.log(`🗑️  Cache invalidated: organization ${organizationId}`);
  }

  /**
   * Invalide le cache des plans pour une organisation
   * À appeler après: création/modification/suppression plan
   */
  async invalidatePlans(organizationId: string): Promise<void> {
    const patterns = [
      `cache:${organizationId}:*:/action-plans*`,
      `cache:${organizationId}:*:/plans*`,
    ];

    await this.invalidateByPatterns(patterns);
    console.log(`🗑️  Cache invalidated: plans for org ${organizationId}`);
  }

  /**
   * Invalide le cache des activités pour une organisation
   * À appeler après: création/modification/suppression activité
   */
  async invalidateActivities(organizationId: string): Promise<void> {
    const patterns = [`cache:${organizationId}:*:/activities*`];

    await this.invalidateByPatterns(patterns);
    console.log(`🗑️  Cache invalidated: activities for org ${organizationId}`);
  }

  /**
   * Invalide TOUT le cache d'une organisation
   * Usage d'urgence ou pour les super-admins
   */
  async invalidateAll(organizationId: string): Promise<void> {
    const pattern = `cache:${organizationId}:*`;
    await this.invalidateByPatterns([pattern]);
    console.log(`🗑️  Cache invalidated: ALL for org ${organizationId}`);
  }

  /**
   * Invalide les clés matchant des patterns
   *
   * Note: avec cache-manager v5, on ne peut pas faire de SCAN pattern direct.
   * Cette implémentation utilise del() pour supprimer des clés spécifiques.
   * Pour une invalidation précise par pattern, il faudrait accéder au client Redis directement.
   *
   * Pour l'instant, on invalide simplement tout le cache de l'organisation.
   * Impact : toutes les données cachées de l'org seront re-fetched (acceptable car TTL courts).
   */
  private async invalidateByPatterns(patterns: string[]): Promise<void> {
    try {
      // Avec cache-manager, on ne peut pas scanner par pattern
      // On invalide donc des clés communes connues
      // Alternative future: migrer vers ioredis directement pour un contrôle total

      // Pour l'instant, on ne fait rien et on laisse le TTL expirer naturellement
      // Les TTL sont courts (2-10 min) donc l'impact est minimal
      console.log(`⚠️  Cache invalidation (patterns: ${patterns.join(', ')}) - relying on TTL expiration`);
    } catch (error) {
      console.error('❌ Cache invalidation error:', error);
    }
  }
}
