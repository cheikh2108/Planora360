import { Controller, Get, NotFoundException, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../common/prisma/prisma.service';
import { StorageService } from './storage.service';

const INLINE_TYPES: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

/**
 * GET /api/files/<clé> — sert un fichier téléversé à un utilisateur authentifié.
 *
 * Contrôle d'accès :
 * - la clé doit commencer par l'organisation de l'utilisateur ;
 * - pièces jointes de messagerie (<org>/messagerie/<conversationId>/...) : participant uniquement ;
 * - anciennes clés (avant correctif) : capitalization/<org>/... et messagerie/<fichier> vérifiées en base.
 * Une clé non autorisée répond 404 (on ne révèle pas son existence).
 */
@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(
    private storage: StorageService,
    private prisma: PrismaService,
  ) {}

  @Get('*key')
  async serve(@Param('key') rawKey: string | string[], @CurrentUser() user: any, @Res() res: Response) {
    const key = (Array.isArray(rawKey) ? rawKey.join('/') : rawKey ?? '').replace(/^\/+/, '');
    if (!key || key.includes('..') || !(await this.canAccess(key, user))) {
      throw new NotFoundException('Fichier introuvable');
    }

    if (!this.storage.isLocal) {
      return res.redirect(302, await this.storage.getSignedUrl(key, 300));
    }

    const filePath = this.storage.localPath(key);
    if (!filePath || !fs.existsSync(filePath)) throw new NotFoundException('Fichier introuvable');

    const ext = path.extname(filePath).toLowerCase();
    const inlineType = INLINE_TYPES[ext];
    res.setHeader('Content-Type', inlineType ?? 'application/octet-stream');
    res.setHeader('Content-Disposition', inlineType ? 'inline' : 'attachment');
    res.setHeader('Cache-Control', 'private, max-age=300');
    return res.sendFile(filePath);
  }

  private async canAccess(key: string, user: any): Promise<boolean> {
    const orgId: string = user.organizationId;
    const parts = key.split('/');

    if (parts[0] === orgId) {
      if (parts[1] === 'messagerie') {
        return this.isParticipant(parts[2], user.id, orgId);
      }
      return true;
    }

    // Anciennes clés de capitalisation : capitalization/<org>/<fiche>/<fichier>
    if (parts[0] === 'capitalization' && parts[1] === orgId) return true;

    // Anciennes pièces jointes : messagerie/<fichier> (sans organisation dans la clé)
    if (parts[0] === 'messagerie' && parts.length === 2) {
      const attachment = await this.prisma.messageAttachment.findFirst({
        where: {
          fileUrl: { contains: key },
          message: {
            conversation: {
              organizationId: orgId,
              participants: { some: { userId: user.id, leftAt: null } },
            },
          },
        },
        select: { id: true },
      });
      return !!attachment;
    }

    return false;
  }

  private async isParticipant(conversationId: string | undefined, userId: string, orgId: string) {
    if (!conversationId) return false;
    const participant = await this.prisma.conversationParticipant.findFirst({
      where: { conversationId, userId, leftAt: null, conversation: { organizationId: orgId } },
      select: { id: true },
    });
    return !!participant;
  }
}
