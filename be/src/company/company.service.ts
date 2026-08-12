import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyStatus, AuditAction } from '@prisma/client';

@Injectable()
export class CompanyService {
  private readonly logger = new Logger(CompanyService.name);

  constructor(private prisma: PrismaService) {}

  async listApprovedCompanies(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        where: { status: CompanyStatus.APPROVED },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          website: true,
          companyEmail: true,
          city: true,
          state: true,
          logo: true,
          linkedin: true,
          _count: {
            select: { jobs: true },
          },
        },
      }),
      this.prisma.company.count({
        where: { status: CompanyStatus.APPROVED },
      }),
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

  async register(dto: RegisterCompanyDto, userId: string) {
    // Check for duplicate company
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
        throw new BadRequestException('Company already registered with this registration number');
      }
      throw new BadRequestException('Company email already registered');
    }

    // Create company with PENDING status
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
        documents: [],
      },
    });

    // Create recruiter
    await this.prisma.recruiter.create({
      data: {
        userId,
        companyId: company.id,
        name: dto.recruiterName,
        email: dto.recruiterEmail,
        phone: dto.recruiterPhone,
        designation: dto.recruiterDesignation,
      },
    });

    // Update user role to RECRUITER
    await this.prisma.user.update({
      where: { id: userId },
      data: { role: 'RECRUITER' },
    });

    // Audit log
    await this.createAuditLog(
      userId,
      company.id,
      AuditAction.COMPANY_REGISTER,
      { companyName: dto.name },
    );

    return {
      message:
        'Company registered successfully. It is now pending verification.',
      companyId: company.id,
    };
  }

  async getProfile(companyId: string) {
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
        _count: {
          select: { jobs: true },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async getStatus(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        status: true,
        rejectionReason: true,
        verifiedAt: true,
        createdAt: true,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async updateProfile(companyId: string, dto: UpdateCompanyDto) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (company.status !== CompanyStatus.APPROVED) {
      throw new ForbiddenException(
        'Company must be approved before updating profile',
      );
    }

    const updated = await this.prisma.company.update({
      where: { id: companyId },
      data: dto,
    });

    return updated;
  }

  async uploadDocuments(companyId: string, files: string[]) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const updated = await this.prisma.company.update({
      where: { id: companyId },
      data: {
        documents: [...company.documents, ...files],
      },
    });

    return updated;
  }

  async getRecruiterCompany(userId: string) {
    const recruiter = await this.prisma.recruiter.findUnique({
      where: { userId },
      include: {
        company: true,
      },
    });

    if (!recruiter) {
      return null;
    }

    return recruiter.company;
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
