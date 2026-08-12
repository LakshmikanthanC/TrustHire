import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { createReadStream } from 'fs';
import { join } from 'path';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationController {
  constructor(private applicationService: ApplicationService) {}

  @Post()
  async create(
    @Body() dto: CreateApplicationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.applicationService.create(dto, userId);
  }

  @Get('me')
  async getMyApplications(@CurrentUser('id') userId: string) {
    return this.applicationService.getUserApplications(userId);
  }

  @Get('company')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RECRUITER)
  async getCompanyApplications(@CurrentUser('id') userId: string) {
    return this.applicationService.getCompanyApplications(userId);
  }

  @Get('job/:jobId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RECRUITER)
  async getJobApplications(
    @Param('jobId') jobId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.applicationService.getJobApplications(jobId, userId);
  }

  @Get(':id/resume')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RECRUITER)
  async downloadResume(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Res() res: Response,
  ) {
    const { filePath, fileName } = await this.applicationService.getResumeForDownload(id, userId);
    const stream = createReadStream(filePath);
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    });
    stream.pipe(res);
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RECRUITER)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.applicationService.updateStatus(id, dto, userId);
  }

  @Put(':id/withdraw')
  async withdrawApplication(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.applicationService.withdrawApplication(id, userId);
  }
}
