import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    const maxRetries = 20;
    const baseDelayMs = 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.$connect();
        return;
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        this.logger.warn(
          `Database connection failed (attempt ${attempt}/${maxRetries}): ${this.extractError(error)}. Retrying...`,
        );
        await this.delay(baseDelayMs * attempt);
      }
    }
  }

  private extractError(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

