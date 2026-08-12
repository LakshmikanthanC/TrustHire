import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { AuditAction, ApplicationStatus } from '@prisma/client';
import { existsSync } from 'fs';
import { join, basename } from 'path';

@Injectable()
export class ApplicationService {
  private readonly logger = new Logger(ApplicationService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateApplicationDto, userId: string) {
    // Check if job exists and is active
    const job = await this.prisma.job.findUnique({
      where: { id: dto.jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (!job.isActive) {
      throw new NotFoundException('This job is no longer accepting applications');
    }

    if (job.deadline && new Date() > job.deadline) {
      throw new NotFoundException('Application deadline has passed');
    }

    // Check if already applied
    const existingApplication = await this.prisma.application.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId: dto.jobId,
        },
      },
    });

    if (existingApplication) {
      throw new ConflictException('You have already applied for this job');
    }

    const application = await this.prisma.application.create({
      data: {
        userId,
        jobId: dto.jobId,
        resume: dto.resume || null,
        coverLetter: dto.coverLetter || null,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: {
              select: { name: true },
            },
          },
        },
      },
    });

    // Audit log
    await this.createAuditLog(
      userId,
      job.companyId,
      AuditAction.APPLICATION_SUBMITTED,
      { jobId: dto.jobId, applicationId: application.id },
    );

    return application;
  }

  async getUserApplications(userId: string) {
    return this.prisma.application.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            jobType: true,
            salaryMin: true,
            salaryMax: true,
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
                city: true,
                state: true,
                recruiters: {
                  select: {
                    userId: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async getCompanyApplications(userId: string) {
    // Get recruiter's company
    const recruiter = await this.prisma.recruiter.findUnique({
      where: { userId },
    });

    if (!recruiter) {
      return [];
    }

    return this.prisma.application.findMany({
      where: {
        job: {
          companyId: recruiter.companyId,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            skills: true,
            experience: true,
            education: true,
            resume: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            location: true,
          },
        },
      },
    });
  }

  async getJobApplications(jobId: string, userId: string) {
    // Verify ownership
    const recruiter = await this.prisma.recruiter.findUnique({
      where: { userId },
    });

    if (!recruiter) {
      return [];
    }

    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job || job.companyId !== recruiter.companyId) {
      throw new NotFoundException('Job not found or access denied');
    }

    return this.prisma.application.findMany({
      where: { jobId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            skills: true,
            experience: true,
            education: true,
            resume: true,
          },
        },
      },
    });
  }

  async updateStatus(
    applicationId: string,
    dto: UpdateApplicationStatusDto,
    userId: string,
  ) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Verify ownership
    const recruiter = await this.prisma.recruiter.findUnique({
      where: { userId },
    });

    if (!recruiter) {
      throw new ForbiddenException('Recruiter profile not found. Please register a company first.');
    }

    if (recruiter.companyId !== application.job.companyId) {
      throw new ForbiddenException('You can only update your own job applications');
    }

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: dto.status,
        notes: dto.notes || undefined,
      },
    });

    // Audit log
    await this.createAuditLog(
      userId,
      recruiter.companyId,
      AuditAction.APPLICATION_STATUS_CHANGED,
      {
        applicationId,
        jobId: application.jobId,
        status: dto.status,
      },
    );

    return updated;
  }

  async getResumeForDownload(applicationId: string, userId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const recruiter = await this.prisma.recruiter.findUnique({
      where: { userId },
    });

    if (!recruiter || recruiter.companyId !== application.job.companyId) {
      throw new ForbiddenException('Access denied');
    }

    const resumeUrl = application.resume || (
      await this.prisma.user.findUnique({ where: { id: application.userId }, select: { resume: true } })
    )?.resume;

    if (!resumeUrl) {
      throw new NotFoundException('No resume available for this candidate');
    }

    const fileName = basename(resumeUrl);
    const filePath = join(process.cwd(), 'uploads', 'resumes', fileName);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Resume file not found on disk');
    }

    await this.createAuditLog(
      userId,
      recruiter.companyId,
      AuditAction.RESUME_DOWNLOADED,
      { applicationId, candidateId: application.userId },
    );

    return { filePath, fileName };
  }

  async withdrawApplication(applicationId: string, userId: string) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.userId !== userId) {
      throw new ForbiddenException('You can only withdraw your own applications');
    }

    if (application.status !== ApplicationStatus.PENDING && application.status !== ApplicationStatus.REVIEWED) {
      throw new BadRequestException('Application can only be withdrawn while pending or under review');
    }

    return this.prisma.application.update({
      where: { id: applicationId },
      data: { status: ApplicationStatus.WITHDRAWN },
    });
  }

  private async createAuditLog(
    userId: string,
    companyId: string,
    action: AuditAction,
    details: any,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          companyId,
          action,
          details: JSON.stringify(details),
          metadata: details,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
    }
  }
}
