import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

/**
 * Prochaine référence lisible pour une organisation : <prefix><numéro sur `pad` chiffres>.
 * Le numéro suit le plus grand numéro existant (et non le nombre d'éléments : une suppression
 * ne doit pas provoquer de doublon). L'unicité est garantie en base par (organizationId, reference).
 */
export function nextReferenceFrom(existing: string[], prefix: string, pad: number): string {
  let max = 0;
  for (const ref of existing) {
    if (!ref?.startsWith(prefix)) continue;
    const n = parseInt(ref.slice(prefix.length), 10);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return `${prefix}${String(max + 1).padStart(pad, '0')}`;
}

/** Vrai si l'erreur Prisma est une violation de contrainte d'unicité (P2002). */
export function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

/**
 * Crée un enregistrement numéroté : en cas de collision (deux créations simultanées),
 * recalcule la référence et réessaie.
 */
export async function createWithReference<T>(
  computeReference: () => Promise<string>,
  create: (reference: string) => Promise<T>,
  attempts = 5,
): Promise<T> {
  for (let i = 0; i < attempts; i++) {
    const reference = await computeReference();
    try {
      return await create(reference);
    } catch (error) {
      if (!isUniqueViolation(error) || i === attempts - 1) throw error;
    }
  }
  throw new ConflictException('Impossible de générer une référence unique, réessayez.');
}
