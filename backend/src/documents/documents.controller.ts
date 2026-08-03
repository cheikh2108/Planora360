import {
  Controller, Post, Get, Delete, Param, Body, UploadedFile,
  UseGuards, UseInterceptors, HttpCode, HttpStatus, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { validateFile } from './file-validator';

const upload = { storage: memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } };

@Controller()
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Post('activities/:activityId/documents')
  @UseInterceptors(FileInterceptor('file', upload))
  async uploadToActivity(
    @Param('activityId') activityId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: string,
    @CurrentUser() user: any,
  ) {
    if (!file) throw new BadRequestException('Fichier manquant');
    await validateFile(file);
    return this.documentsService.uploadToActivity(activityId, file, type, user.organizationId, user.id);
  }

  @Get('activities/:activityId/documents')
  findByActivity(@Param('activityId') activityId: string, @CurrentUser() user: any) {
    return this.documentsService.findByActivity(activityId, user.organizationId);
  }

  @Post('checklist-items/:itemId/documents')
  @UseInterceptors(FileInterceptor('file', upload))
  async uploadToChecklist(
    @Param('itemId') itemId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: string,
    @CurrentUser() user: any,
  ) {
    if (!file) throw new BadRequestException('Fichier manquant');
    await validateFile(file);
    return this.documentsService.uploadToChecklistItem(itemId, file, type, user.organizationId, user.id);
  }

  @Get('checklist-items/:itemId/documents')
  findByChecklistItem(@Param('itemId') itemId: string, @CurrentUser() user: any) {
    return this.documentsService.findByChecklistItem(itemId, user.organizationId);
  }

  @Get('documents/:id/download')
  getDownloadUrl(@Param('id') id: string, @CurrentUser() user: any) {
    return this.documentsService.getDownloadUrl(id, user.organizationId);
  }

  @Delete('documents/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.documentsService.remove(id, user.organizationId);
  }
}
