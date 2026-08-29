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
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

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

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx'];

// Limite de taille : 10MB par fichier
const MAX_FILE_SIZE = 10 * 1024 * 1024;

@Controller('messagerie')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly messagerieService: MessagerieService) {}

  @Post('conversations/:conversationId/upload')
  @UseInterceptors(
    FilesInterceptor('files', 3, {
      // Max 3 fichiers
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/messagerie';
          // Créer le dossier s'il n'existe pas
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          // Nom sécurisé : timestamp + random + extension
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Validation MIME type
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          return cb(
            new BadRequestException(`Type de fichier non autorisé: ${file.mimetype}`),
            false,
          );
        }

        // Validation extension
        const ext = extname(file.originalname).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
          return cb(
            new BadRequestException(`Extension non autorisée: ${ext}`),
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

    // Créer le message avec les fichiers attachés
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const attachments = files.map((file) => ({
      fileName: file.originalname,
      fileUrl: `/uploads/messagerie/${file.filename}`,
      fileSize: file.size,
      mimeType: file.mimetype,
    }));

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
