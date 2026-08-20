import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ParticipantsService } from './participants.service';
import { ImportParticipantsDto } from './dto/import-participants.dto';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

const upload = {
  storage: memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB max pour les imports Excel
};

@Controller('participants')
@UseGuards(JwtAuthGuard)
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Post()
  async create(@Body() dto: CreateParticipantDto, @Request() req) {
    return this.participantsService.create(dto, req.user.organizationId, req.user.id);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file', upload))
  async import(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ImportParticipantsDto,
    @Request() req,
  ) {
    return this.participantsService.importFromExcel(
      file,
      dto.activityId,
      req.user.organizationId,
      req.user.id,
    );
  }

  @Get('activity/:activityId')
  async findByActivity(@Param('activityId') activityId: string, @Request() req) {
    return this.participantsService.findByActivity(activityId, req.user.organizationId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.participantsService.remove(id, req.user.organizationId);
  }
}
