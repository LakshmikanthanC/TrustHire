import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(private prisma: PrismaService) {}

  async sendMessage(dto: CreateMessageDto, senderId: string) {
    if (senderId === dto.receiverId) {
      throw new ForbiddenException('You cannot send a message to yourself');
    }

    const receiver = await this.prisma.user.findUnique({
      where: { id: dto.receiverId },
    });

    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }

    const message = await this.prisma.message.create({
      data: {
        senderId,
        receiverId: dto.receiverId,
        subject: dto.subject,
        content: dto.content,
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, role: true },
        },
        receiver: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    return message;
  }

  async getConversations(userId: string) {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: { id: true, name: true, email: true, role: true },
        },
        receiver: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    const conversationMap = new Map<
      string,
      {
        otherUser: { id: string; name: string; email: string; role: string };
        lastMessage: typeof messages[0];
        unreadCount: number;
      }
    >();

    for (const msg of messages) {
      const otherUserId =
        msg.senderId === userId ? msg.receiverId : msg.senderId;
      const otherUser =
        msg.senderId === userId ? msg.receiver : msg.sender;

      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          otherUser,
          lastMessage: msg,
          unreadCount:
            msg.receiverId === userId && !msg.isRead ? 1 : 0,
        });
      } else {
        const existing = conversationMap.get(otherUserId)!;
        if (
          msg.receiverId === userId &&
          !msg.isRead &&
          msg.createdAt > existing.lastMessage.createdAt
        ) {
          existing.unreadCount++;
        }
      }
    }

    return Array.from(conversationMap.values()).sort(
      (a, b) =>
        new Date(b.lastMessage.createdAt).getTime() -
        new Date(a.lastMessage.createdAt).getTime(),
    );
  }

  async getMessagesWithUser(userId: string, otherUserId: string) {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { id: true, name: true, email: true, role: true },
        },
        receiver: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    await this.prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return messages;
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });

    return { count };
  }
}
