import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CompanyModule } from './company/company.module.js';
import { JobModule } from './job/job.module.js';
import { ApplicationModule } from './application/application.module.js';
import { AdminModule } from './admin/admin.module.js';
import { UploadModule } from './upload/upload.module.js';
import { MessageModule } from './message/message.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    AuthModule,
    CompanyModule,
    JobModule,
    ApplicationModule,
    AdminModule,
    UploadModule,
    MessageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

