import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Post()
  async send(
    @Body() dto: CreateMessageDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.messageService.sendMessage(dto, userId);
  }

  @Get('conversations')
  async getConversations(@CurrentUser('id') userId: string) {
    return this.messageService.getConversations(userId);
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser('id') userId: string) {
    return this.messageService.getUnreadCount(userId);
  }

  @Get(':otherUserId')
  async getMessages(
    @Param('otherUserId') otherUserId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.messageService.getMessagesWithUser(userId, otherUserId);
  }
}
