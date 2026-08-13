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
import { ParticipantsService } from './participants.service';
import { ImportParticipantsDto } from './dto/import-participants.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('participants')
@UseGuards(JwtAuthGuard)
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  async import(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ImportParticipantsDto,
    @Request() req,
  ) {
    return this.participantsService.importFromExcel(
      file,
      dto.activityId,
      req.user.organizationId,
      req.user.sub,
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
