import {
  Controller, Post, Get, Delete, Param, Body, UploadedFile,
  UseGuards, UseInterceptors, HttpCode, HttpStatus, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

const storage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

@Controller()
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Post('activities/:activityId/documents')
  @UseInterceptors(FileInterceptor('file', { storage, limits: { fileSize: MAX_FILE_SIZE } }))
  uploadToActivity(
    @Param('activityId') activityId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: string,
    @CurrentUser() user: any,
  ) {
    if (!file) throw new BadRequestException('Fichier manquant');
    return this.documentsService.uploadToActivity(activityId, file, type ?? 'autre', user.organizationId, user.id);
  }

  @Get('activities/:activityId/documents')
  findByActivity(@Param('activityId') activityId: string, @CurrentUser() user: any) {
    return this.documentsService.findByActivity(activityId, user.organizationId);
  }

  @Post('checklist-items/:itemId/documents')
  @UseInterceptors(FileInterceptor('file', { storage, limits: { fileSize: MAX_FILE_SIZE } }))
  uploadToChecklist(
    @Param('itemId') itemId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: string,
    @CurrentUser() user: any,
  ) {
    if (!file) throw new BadRequestException('Fichier manquant');
    return this.documentsService.uploadToChecklistItem(itemId, file, type ?? 'autre', user.organizationId, user.id);
  }

  @Get('checklist-items/:itemId/documents')
  findByChecklistItem(@Param('itemId') itemId: string, @CurrentUser() user: any) {
    return this.documentsService.findByChecklistItem(itemId, user.organizationId);
  }

  @Delete('documents/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.documentsService.remove(id, user.organizationId);
  }
}
