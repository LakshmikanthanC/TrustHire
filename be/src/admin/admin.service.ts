import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminCreateCompanyDto, AdminCreateJobDto } from './dto/create-company.dto';
import { AdminCreateRecruiterDto } from './dto/create-recruiter.dto';
import { UpdateCompanyDto, UpdateJobDto } from './dto/update-company.dto';
import * as argon2 from 'argon2';
import {
  CompanyStatus,
  AuditAction,
  VerificationStatus,
} from '@prisma/client';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private prisma: PrismaService) {}

  async createCompany(dto: AdminCreateCompanyDto, adminId: string) {
    const existing = await this.prisma.company.findFirst({
      where: {
        OR: [
          { registrationNumber: dto.registrationNumber },
          { companyEmail: dto.companyEmail },
        ],
      },
    });

    if (existing) {
      if (existing.registrationNumber === dto.registrationNumber) {
        throw new ConflictException('Company already registered with this registration number');
      }
      throw new ConflictException('Company email already registered');
    }

    const company = await this.prisma.company.create({
      data: {
        name: dto.name,
        registrationNumber: dto.registrationNumber,
        gstNumber: dto.gstNumber,
        pan: dto.pan,
        website: dto.website,
        companyEmail: dto.companyEmail,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        pincode: dto.pincode,
        linkedin: dto.linkedin,
        status: CompanyStatus.APPROVED,
        verifiedAt: new Date(),
        documents: [],
      },
    });

    let job: any = null;
    if (dto.job) {
      job = await this.prisma.job.create({
        data: {
          companyId: company.id,
          title: dto.job.title,
          description: dto.job.description,
          responsibilities: dto.job.responsibilities || [],
          requirements: dto.job.requirements || [],
          skills: dto.job.skills,
          salaryMin: dto.job.salaryMin != null ? BigInt(Math.floor(dto.job.salaryMin)) : null,
          salaryMax: dto.job.salaryMax != null ? BigInt(Math.floor(dto.job.salaryMax)) : null,
          experienceMin: dto.job.experienceMin,
          experienceMax: dto.job.experienceMax,
          location: dto.job.location,
          jobType: dto.job.jobType || 'FULL_TIME',
          vacancies: dto.job.vacancies || 1,
          deadline: dto.job.deadline ? new Date(dto.job.deadline) : null,
        },
      });
    }

    await this.createAuditLog(adminId, company.id, AuditAction.COMPANY_REGISTER, {
      companyName: dto.name,
      createdBy: 'ADMIN',
      jobCreated: !!job,
    });

    return {
      message: job
        ? 'Company and job created successfully'
        : 'Company created and approved successfully',
      company,
      job,
    };
  }

  async updateCompany(companyId: string, dto: UpdateCompanyDto, adminId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const updated = await this.prisma.company.update({
      where: { id: companyId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.website !== undefined && { website: dto.website }),
        ...(dto.companyEmail !== undefined && { companyEmail: dto.companyEmail }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.state !== undefined && { state: dto.state }),
        ...(dto.pincode !== undefined && { pincode: dto.pincode }),
        ...(dto.linkedin !== undefined && { linkedin: dto.linkedin }),
        ...(dto.gstNumber !== undefined && { gstNumber: dto.gstNumber }),
        ...(dto.pan !== undefined && { pan: dto.pan }),
      },
    });

    await this.createAuditLog(adminId, companyId, AuditAction.COMPANY_REGISTER, {
      action: 'COMPANY_UPDATED',
      companyName: updated.name,
    });

    return updated;
  }

  async deleteCompany(companyId: string, adminId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { _count: { select: { jobs: true, recruiters: true } } },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Audit log BEFORE deleting (FK constraint)
    await this.createAuditLog(adminId, companyId, AuditAction.COMPANY_BLOCKED, {
      action: 'COMPANY_DELETED',
      companyName: company.name,
      deletedJobs: company._count.jobs,
      deletedRecruiters: company._count.recruiters,
    });

    await this.prisma.application.deleteMany({ where: { job: { companyId } } });
    await this.prisma.job.deleteMany({ where: { companyId } });
    await this.prisma.recruiter.deleteMany({ where: { companyId } });
    await this.prisma.company.delete({ where: { id: companyId } });

    return {
      message: `Company "${company.name}" and all associated data deleted successfully`,
    };
  }

  async getCompanyById(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        recruiters: {
          select: {
            id: true,
            name: true,
            email: true,
            designation: true,
            identityVerified: true,
          },
        },
        jobs: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: { select: { applications: true } },
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async createJobForCompany(
    companyId: string,
    dto: AdminCreateJobDto,
    adminId: string,
  ) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (company.status !== CompanyStatus.APPROVED) {
      throw new BadRequestException('Company must be approved before posting jobs');
    }

    const job = await this.prisma.job.create({
      data: {
        companyId,
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

    await this.createAuditLog(adminId, companyId, AuditAction.JOB_POSTED, {
      jobId: job.id,
      title: job.title,
      createdBy: 'ADMIN',
    });

    return job;
  }

  async updateJob(jobId: string, dto: UpdateJobDto, adminId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const updated = await this.prisma.job.update({
      where: { id: jobId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.responsibilities !== undefined && { responsibilities: dto.responsibilities }),
        ...(dto.requirements !== undefined && { requirements: dto.requirements }),
        ...(dto.skills !== undefined && { skills: dto.skills }),
        ...(dto.salaryMin !== undefined && { salaryMin: dto.salaryMin != null ? BigInt(Math.floor(dto.salaryMin)) : null }),
        ...(dto.salaryMax !== undefined && { salaryMax: dto.salaryMax != null ? BigInt(Math.floor(dto.salaryMax)) : null }),
        ...(dto.experienceMin !== undefined && { experienceMin: dto.experienceMin }),
        ...(dto.experienceMax !== undefined && { experienceMax: dto.experienceMax }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.jobType !== undefined && { jobType: dto.jobType }),
        ...(dto.vacancies !== undefined && { vacancies: dto.vacancies }),
        ...(dto.deadline !== undefined && {
          deadline: dto.deadline ? new Date(dto.deadline) : null,
        }),
      },
    });

    await this.createAuditLog(adminId, job.companyId, AuditAction.JOB_UPDATED, {
      jobId,
      action: 'JOB_UPDATED_BY_ADMIN',
    });

    return updated;
  }

  async deleteJob(jobId: string, adminId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    await this.prisma.job.delete({ where: { id: jobId } });

    await this.createAuditLog(adminId, job.companyId, AuditAction.JOB_DELETED, {
      jobId,
      title: job.title,
      action: 'JOB_DELETED_BY_ADMIN',
    });

    return { message: `Job "${job.title}" deleted successfully` };
  }

  async getAllJobs(companyId?: string, page = 1, limit = 10) {
    const where: any = {};
    if (companyId) {
      where.companyId = companyId;
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
            select: { id: true, name: true, city: true, state: true },
          },
          _count: { select: { applications: true } },
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
      },
    };
  }

  async createRecruiterForCompany(
    companyId: string,
    dto: AdminCreateRecruiterDto,
    adminId: string,
  ) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, { phone: dto.phone }],
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email or phone already exists');
    }

    const hashedPassword = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        password: hashedPassword,
        name: dto.name,
        role: 'RECRUITER',
        verificationStatus: VerificationStatus.FULLY_VERIFIED,
        emailVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
      },
    });

    await this.prisma.recruiter.create({
      data: {
        userId: user.id,
        companyId: companyId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        designation: dto.designation,
        identityVerified: true,
      },
    });

    await this.createAuditLog(adminId, companyId, AuditAction.COMPANY_REGISTER, {
      action: 'RECRUITER_CREATED',
      recruiterEmail: dto.email,
      companyName: company.name,
    });

    return {
      message: 'Recruiter created and assigned successfully',
      recruiter: {
        id: user.id,
        email: user.email,
        name: user.name,
        designation: dto.designation,
        companyId,
      },
    };
  }

  async getDashboardStats() {
    const [
      totalUsers,
      totalCompanies,
      totalJobs,
      totalApplications,
      pendingCompanies,
      approvedCompanies,
      rejectedCompanies,
      blockedCompanies,
      reportedUsers,
      recentAuditLogs,
      topCompaniesByJobs,
      jobsByType,
      recentApplications,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.company.count(),
      this.prisma.job.count({ where: { isActive: true } }),
      this.prisma.application.count(),
      this.prisma.company.count({ where: { status: CompanyStatus.PENDING } }),
      this.prisma.company.count({ where: { status: CompanyStatus.APPROVED } }),
      this.prisma.company.count({ where: { status: CompanyStatus.REJECTED } }),
      this.prisma.company.count({ where: { status: CompanyStatus.BLOCKED } }),
      this.prisma.user.count({ where: { isActive: false } }),
      this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: { select: { id: true, name: true, email: true } },
          company: { select: { id: true, name: true } },
        },
      }),
      this.prisma.company.findMany({
        orderBy: { jobs: { _count: 'desc' } },
        take: 5,
        select: {
          id: true,
          name: true,
          status: true,
          city: true,
          _count: { select: { jobs: true } },
        },
      }),
      this.prisma.job.groupBy({
        by: ['jobType'],
        _count: { id: true },
        where: { isActive: true },
      }),
      this.prisma.application.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: { select: { id: true, name: true, email: true } },
          job: {
            select: {
              id: true,
              title: true,
              company: { select: { name: true } },
            },
          },
        },
      }),
    ]);

    return {
      totalUsers,
      totalCompanies,
      totalJobs,
      totalApplications,
      pendingCompanies,
      approvedCompanies,
      rejectedCompanies,
      blockedCompanies,
      reportedUsers,
      recentActivity: recentAuditLogs.map((log) => ({
        id: log.id,
        description: `${log.user?.name || 'System'} — ${log.action.replace(/_/g, ' ').toLowerCase()}${log.company ? ` (${log.company.name})` : ''}`,
        timestamp: log.createdAt,
        action: log.action,
      })),
      topCompanies: topCompaniesByJobs,
      jobsByType: jobsByType.map((j) => ({
        type: j.jobType,
        count: j._count.id,
      })),
      recentApplications: recentApplications.map((app) => ({
        id: app.id,
        candidate: app.user.name,
        job: app.job.title,
        company: app.job.company.name,
        status: app.status,
        appliedAt: app.createdAt,
      })),
    };
  }

  async getCompanies(status?: CompanyStatus, page = 1, limit = 10) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          recruiters: {
            select: {
              id: true,
              name: true,
              email: true,
              designation: true,
              identityVerified: true,
            },
          },
          _count: {
            select: { jobs: true },
          },
        },
      }),
      this.prisma.company.count({ where }),
    ]);

    return {
      data: companies,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async approveCompany(companyId: string, adminId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (company.status !== CompanyStatus.PENDING) {
      throw new BadRequestException(
        `Company is already ${company.status.toLowerCase()}`,
      );
    }

    const updated = await this.prisma.company.update({
      where: { id: companyId },
      data: {
        status: CompanyStatus.APPROVED,
        verifiedAt: new Date(),
      },
    });

    await this.createAuditLog(adminId, companyId, AuditAction.COMPANY_APPROVED, {
      companyName: company.name,
    });

    return updated;
  }

  async rejectCompany(companyId: string, reason: string, adminId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const updated = await this.prisma.company.update({
      where: { id: companyId },
      data: {
        status: CompanyStatus.REJECTED,
        rejectionReason: reason,
      },
    });

    await this.createAuditLog(adminId, companyId, AuditAction.COMPANY_REJECTED, {
      companyName: company.name,
      reason,
    });

    return updated;
  }

  async blockCompany(companyId: string, reason: string, adminId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    await this.prisma.company.update({
      where: { id: companyId },
      data: {
        status: CompanyStatus.BLOCKED,
        isBlacklisted: true,
        blacklistReason: reason,
      },
    });

    await this.prisma.job.updateMany({
      where: { companyId },
      data: { isActive: false },
    });

    await this.prisma.blacklistedCompany.create({
      data: {
        name: company.name,
        domain: company.website,
        email: company.companyEmail,
        reason,
      },
    });

    await this.createAuditLog(adminId, companyId, AuditAction.COMPANY_BLOCKED, {
      companyName: company.name,
      reason,
    });

    return { message: 'Company blocked successfully' };
  }

  async blockUser(userId: string, reason: string, adminId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    await this.createAuditLog(adminId, null, AuditAction.SUSPICIOUS_ACTIVITY, {
      action: 'USER_BLOCKED',
      blockedUserId: userId,
      reason,
    });

    return { message: 'User blocked successfully' };
  }

  async getAuditLogs(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          company: { select: { id: true, name: true } },
        },
      }),
      this.prisma.auditLog.count(),
    ]);

    return {
      data: logs,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getReports() {
    const suspiciousActivities = await this.prisma.auditLog.findMany({
      where: { action: AuditAction.SUSPICIOUS_ACTIVITY },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    const topCompaniesByJobs = await this.prisma.company.findMany({
      orderBy: { jobs: { _count: 'desc' } },
      take: 10,
      select: {
        id: true,
        name: true,
        status: true,
        _count: { select: { jobs: true } },
      },
    });

    return { suspiciousActivities, topCompaniesByJobs };
  }

  async getBlacklistedCompanies() {
    return this.prisma.blacklistedCompany.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUsers(role?: string, page = 1, limit = 10) {
    const where: any = {};
    if (role) {
      where.role = role;
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
          verificationStatus: true,
          createdAt: true,
          _count: {
            select: { applications: true, sentMessages: true, receivedMessages: true },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private async createAuditLog(
    userId: string,
    companyId: string | null,
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
