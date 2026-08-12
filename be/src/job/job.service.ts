import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { SearchJobDto } from './dto/search-job.dto';
import { AuditAction, CompanyStatus } from '@prisma/client';

@Injectable()
export class JobService {
  private readonly logger = new Logger(JobService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateJobDto, userId: string) {
    // Verify user is a recruiter and company is approved
    const recruiter = await this.prisma.recruiter.findUnique({
      where: { userId },
      include: { company: true },
    });

    if (!recruiter) {
      throw new ForbiddenException('Only recruiters can post jobs');
    }

    if (recruiter.company.status !== CompanyStatus.APPROVED) {
      throw new ForbiddenException(
        'Your company must be approved before posting jobs. Current status: ' +
          recruiter.company.status,
      );
    }

    const job = await this.prisma.job.create({
      data: {
        companyId: recruiter.companyId,
        title: dto.title,
        description: dto.description,
        responsibilities: dto.responsibilities || [],
        requirements: dto.requirements || [],
        skills: dto.skills,
        salaryMin: dto.salaryMin,
        salaryMax: dto.salaryMax,
        experienceMin: dto.experienceMin,
        experienceMax: dto.experienceMax,
        location: dto.location,
        jobType: dto.jobType || 'FULL_TIME',
        vacancies: dto.vacancies || 1,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
      },
    });

    // Audit log
    await this.createAuditLog(
      userId,
      recruiter.companyId,
      AuditAction.JOB_POSTED,
      { jobId: job.id, title: job.title },
    );

    return job;
  }

  async findAll(query: SearchJobDto) {
    const {
      search,
      location,
      jobType,
      companyId,
      salaryMin,
      salaryMax,
      skills,
      page = 1,
      limit = 10,
    } = query;

    const where: any = { isActive: true };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (jobType) {
      where.jobType = jobType;
    }

    if (companyId) {
      where.companyId = companyId;
    }

    if (salaryMin) {
      where.salaryMax = { gte: salaryMin };
    }

    if (salaryMax) {
      where.salaryMin = { lte: salaryMax };
    }

    if (skills && skills.length > 0) {
      where.skills = { hasSome: skills };
    }

    const skip = (page - 1) * limit;

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
              city: true,
              state: true,
            },
          },
          _count: {
            select: { applications: true },
          },
        },
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      data: jobs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
            city: true,
            state: true,
            website: true,
            linkedin: true,
          },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  async update(id: string, dto: UpdateJobDto, userId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Verify ownership
    const recruiter = await this.prisma.recruiter.findUnique({
      where: { userId },
    });

    if (!recruiter || recruiter.companyId !== job.companyId) {
      throw new ForbiddenException('You can only update your own jobs');
    }

    const updated = await this.prisma.job.update({
      where: { id },
      data: dto,
    });

    // Audit log
    await this.createAuditLog(
      userId,
      job.companyId,
      AuditAction.JOB_UPDATED,
      { jobId: id },
    );

    return updated;
  }

  async remove(id: string, userId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: { company: true },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const recruiter = await this.prisma.recruiter.findUnique({
      where: { userId },
    });

    if (!recruiter || recruiter.companyId !== job.companyId) {
      throw new ForbiddenException('You can only delete your own jobs');
    }

    await this.prisma.job.delete({ where: { id } });

    // Audit log
    await this.createAuditLog(
      userId,
      job.companyId,
      AuditAction.JOB_DELETED,
      { jobId: id, title: job.title },
    );

    return { message: 'Job deleted successfully' };
  }

  async getMyJobs(userId: string) {
    // Find the recruiter's company
    const recruiter = await this.prisma.recruiter.findUnique({
      where: { userId },
    });

    if (!recruiter) {
      return [];
    }

    return this.prisma.job.findMany({
      where: { companyId: recruiter.companyId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { applications: true },
        },
      },
    });
  }

  async getCompanyJobs(companyId: string) {
    return this.prisma.job.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { applications: true },
        },
      },
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
