import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
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

@Controller('messagerie/upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  @Post()
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
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[], @Req() req) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    // Double validation de sécurité côté serveur
    for (const file of files) {
      // Vérifier taille
      if (file.size > MAX_FILE_SIZE) {
        throw new BadRequestException(
          `Fichier trop volumineux: ${file.originalname} (max 10MB)`,
        );
      }

      // Vérifier MIME type
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new BadRequestException(
          `Type non autorisé: ${file.originalname} (${file.mimetype})`,
        );
      }
    }

    // Retourner les infos des fichiers uploadés
    return {
      success: true,
      files: files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: `/uploads/messagerie/${file.filename}`,
        url: `${req.protocol}://${req.get('host')}/uploads/messagerie/${file.filename}`,
      })),
    };
  }
}
