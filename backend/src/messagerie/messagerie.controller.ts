import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MessagerieService } from './messagerie.service';
import { ConversationType } from '@prisma/client';

@Controller('messagerie')
@UseGuards(JwtAuthGuard)
export class MessagerieController {
  constructor(private readonly messagerieService: MessagerieService) {}

  @Get('conversations')
  getUserConversations(@Req() req) {
    return this.messagerieService.getUserConversations(
      req.user.id,
      req.user.organizationId,
    );
  }

  @Post('conversations')
  createConversation(
    @Req() req,
    @Body('type') type: ConversationType,
    @Body('name') name?: string,
    @Body('participantIds') participantIds?: string[],
    @Body('context') context?: any,
  ) {
    return this.messagerieService.createConversation(
      req.user.organizationId,
      req.user.id,
      type,
      name,
      participantIds,
      context,
    );
  }

  @Get('conversations/:conversationId/messages')
  getMessages(
    @Req() req,
    @Param('conversationId') conversationId: string,
    @Query('limit') limit?: number,
    @Query('before') before?: string,
  ) {
    return this.messagerieService.getMessages(
      conversationId,
      req.user.id,
      limit ? Number(limit) : 50,
      before,
    );
  }

  @Post('conversations/:conversationId/messages')
  sendMessage(
    @Req() req,
    @Param('conversationId') conversationId: string,
    @Body('content') content: string,
    @Body('contentType') contentType?: string,
    @Body('parentId') parentId?: string,
  ) {
    return this.messagerieService.sendMessage(
      conversationId,
      req.user.id,
      content,
      contentType,
      parentId,
    );
  }

  @Post('conversations/:conversationId/mark-read')
  markConversationAsRead(
    @Req() req,
    @Param('conversationId') conversationId: string,
  ) {
    return this.messagerieService.markConversationAsRead(
      conversationId,
      req.user.id,
    );
  }

  @Delete('conversations/:conversationId')
  deleteConversation(
    @Req() req,
    @Param('conversationId') conversationId: string,
  ) {
    return this.messagerieService.deleteConversation(
      conversationId,
      req.user.id,
    );
  }
}
