import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  ForbiddenException,
  Req,
  Body,
  Param,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../common/prisma/prisma.service';
import { MessagerieService } from './messagerie.service';
import { StorageService } from '../storage/storage.service';
import { validateFile, MEDIA_EXTENSIONS } from '../documents/file-validator';

// Limite : 10 Mo par fichier, 3 fichiers par message
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 3;

@Controller('messagerie')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(
    private readonly messagerieService: MessagerieService,
    private readonly storageService: StorageService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('conversations/:conversationId/upload')
  @UseInterceptors(
    FilesInterceptor('files', MAX_FILES, {
      // Stockage en mémoire (pas sur disque) ; le contenu réel est vérifié ensuite
      limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
    }),
  )
  async uploadFiles(
    @Param('conversationId') conversationId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body('content') content: string,
    @Req() req,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    // 1. L'utilisateur doit participer à la conversation AVANT tout envoi vers le stockage
    const participant = await this.prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId: req.user.id,
        leftAt: null,
        conversation: { organizationId: req.user.organizationId },
      },
      select: { id: true },
    });
    if (!participant) {
      throw new ForbiddenException('Vous n\'êtes pas participant de cette conversation');
    }

    // 2. Extension + contenu réel (magic bytes) de chaque fichier
    const extensions: string[] = [];
    for (const file of files) {
      extensions.push(await validateFile(file, { allowed: MEDIA_EXTENSIONS, maxSize: MAX_FILE_SIZE }));
    }

    // 3. Clé <org>/messagerie/<conversation>/<uuid>.<ext> et URL stable servie par /api/files
    const attachments = await Promise.all(
      files.map(async (file, i) => {
        const storageKey = this.storageService.buildKey(
          req.user.organizationId,
          ['messagerie', conversationId],
          extensions[i],
        );
        await this.storageService.upload(storageKey, file);
        return {
          fileName: file.originalname,
          fileUrl: this.storageService.fileUrl(storageKey),
          fileSize: file.size,
          mimeType: file.mimetype,
        };
      }),
    );

    const message = await this.messagerieService.sendMessageWithAttachments(
      conversationId,
      req.user.id,
      content || 'Fichier(s) partagé(s)',
      attachments,
    );

    return {
      success: true,
      message,
    };
  }
}
