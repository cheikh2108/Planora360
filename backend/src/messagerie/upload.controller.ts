import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Req,
  Body,
  Param,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MessagerieService } from './messagerie.service';
import { StorageService } from '../storage/storage.service';

// Types de fichiers autorisés (WHITELIST stricte)
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

// Limite de taille : 10MB par fichier
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Générer un nom de fichier sécurisé
function generateFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1e9);
  const ext = originalName.substring(originalName.lastIndexOf('.'));
  return `${timestamp}-${random}${ext}`;
}

@Controller('messagerie')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(
    private readonly messagerieService: MessagerieService,
    private readonly storageService: StorageService,
  ) {}

  @Post('conversations/:conversationId/upload')
  @UseInterceptors(
    FilesInterceptor('files', 3, {
      // Max 3 fichiers, stockage en mémoire (pas sur disque)
      fileFilter: (req, file, cb) => {
        // Validation MIME type
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          return cb(
            new BadRequestException(`Type de fichier non autorisé: ${file.mimetype}`),
            false,
          );
        }

        cb(null, true);
      },
      limits: {
        fileSize: MAX_FILE_SIZE, // 10MB
        files: 3, // Max 3 fichiers
      },
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

    // Double validation de sécurité côté serveur
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        throw new BadRequestException(
          `Fichier trop volumineux: ${file.originalname} (max 10MB)`,
        );
      }

      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new BadRequestException(
          `Type non autorisé: ${file.originalname} (${file.mimetype})`,
        );
      }
    }

    // Upload vers Backblaze B2 (ou local si non configuré)
    const attachments = await Promise.all(
      files.map(async (file) => {
        // Générer nom sécurisé et clé de stockage
        const filename = generateFilename(file.originalname);
        const storageKey = `messagerie/${filename}`;

        // Upload vers B2
        await this.storageService.upload(storageKey, file);

        // Obtenir URL publique
        const fileUrl = this.storageService.getPublicUrl(storageKey);

        return {
          fileName: file.originalname,
          fileUrl,
          fileSize: file.size,
          mimeType: file.mimetype,
        };
      }),
    );

    // Créer le message avec les fichiers attachés
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
