import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/** Durée de vie du numéro de version (ms) : bien au-delà du TTL des réponses mises en cache. */
const VERSION_TTL_MS = 7 * 24 * 3600 * 1000;

/**
 * Invalidation du cache HTTP par numéro de version d'organisation.
 *
 * Les clés de cache contiennent la version courante de l'organisation
 * (`cache:<org>:v<version>:...`). Invalider revient à changer cette version : les anciennes
 * entrées ne sont plus jamais lues et expirent d'elles-mêmes. Cela fonctionne avec n'importe quel
 * store (mémoire ou Redis), sans parcours de clés par motif.
 *
 * La version est aussi changée automatiquement après toute mutation réussie
 * (voir CacheVersionInterceptor) ; les méthodes ci-dessous restent utilisables pour les
 * changements qui ne passent pas par une requête HTTP (tâches planifiées, webhooks).
 */
@Injectable()
export class CacheInvalidationService {
  private readonly logger = new Logger(CacheInvalidationService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  private versionKey(organizationId: string) {
    return `cache-version:${organizationId}`;
  }

  /** Version courante du cache de l'organisation (0 si jamais invalidé). */
  async getVersion(organizationId: string): Promise<string> {
    try {
      const version = await this.cacheManager.get<string>(this.versionKey(organizationId));
      return version ?? '0';
    } catch {
      return '0';
    }
  }

  /** Invalide toutes les réponses mises en cache pour l'organisation. */
  async invalidateAll(organizationId: string | null | undefined): Promise<void> {
    if (!organizationId) return;
    try {
      const version = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
      await this.cacheManager.set(this.versionKey(organizationId), version, VERSION_TTL_MS);
    } catch (error) {
      // Un cache indisponible ne doit pas faire échouer la mutation
      this.logger.error(`Invalidation du cache impossible : ${error.message}`);
    }
  }

  // Alias conservés pour les appels existants : l'invalidation est par organisation.
  invalidateDashboard(organizationId: string) {
    return this.invalidateAll(organizationId);
  }
  invalidateUsers(organizationId: string) {
    return this.invalidateAll(organizationId);
  }
  invalidateRoles(organizationId: string) {
    return this.invalidateAll(organizationId);
  }
  invalidateOrganization(organizationId: string) {
    return this.invalidateAll(organizationId);
  }
  invalidatePlans(organizationId: string) {
    return this.invalidateAll(organizationId);
  }
  invalidateActivities(organizationId: string) {
    return this.invalidateAll(organizationId);
  }
}
