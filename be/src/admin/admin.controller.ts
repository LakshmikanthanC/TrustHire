import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminCreateCompanyDto, AdminCreateJobDto } from './dto/create-company.dto';
import { AdminCreateRecruiterDto } from './dto/create-recruiter.dto';
import { UpdateCompanyDto, UpdateJobDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole, CompanyStatus } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('dashboard')
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Post('companies')
  async createCompany(
    @Body() dto: AdminCreateCompanyDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.createCompany(dto, adminId);
  }

  @Put('companies/:id')
  async updateCompany(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.updateCompany(id, dto, adminId);
  }

  @Delete('companies/:id')
  async deleteCompany(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.deleteCompany(id, adminId);
  }

  @Get('companies')
  async getCompanies(
    @Query('status') status?: CompanyStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getCompanies(status, page, limit);
  }

  @Get('companies/:id')
  async getCompanyById(@Param('id') id: string) {
    return this.adminService.getCompanyById(id);
  }

  @Post('companies/:id/jobs')
  async createJobForCompany(
    @Param('id') companyId: string,
    @Body() dto: AdminCreateJobDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.createJobForCompany(companyId, dto, adminId);
  }

  @Put('jobs/:id')
  async updateJob(
    @Param('id') jobId: string,
    @Body() dto: UpdateJobDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.updateJob(jobId, dto, adminId);
  }

  @Delete('jobs/:id')
  async deleteJob(
    @Param('id') jobId: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.deleteJob(jobId, adminId);
  }

  @Get('jobs')
  async getAllJobs(
    @Query('companyId') companyId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getAllJobs(companyId, page, limit);
  }

  @Post('companies/:id/recruiter')
  async createRecruiterForCompany(
    @Param('id') companyId: string,
    @Body() dto: AdminCreateRecruiterDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.createRecruiterForCompany(companyId, dto, adminId);
  }

  @Post('approve-company/:id')
  async approveCompany(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.approveCompany(id, adminId);
  }

  @Post('reject-company/:id')
  async rejectCompany(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.rejectCompany(id, reason, adminId);
  }

  @Post('block-company/:id')
  async blockCompany(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.blockCompany(id, reason, adminId);
  }

  @Post('block-user/:id')
  async blockUser(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.blockUser(id, reason, adminId);
  }

  @Get('audit-logs')
  async getAuditLogs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getAuditLogs(page, limit);
  }

  @Get('reports')
  async getReports() {
    return this.adminService.getReports();
  }

  @Get('blacklist')
  async getBlacklist() {
    return this.adminService.getBlacklistedCompanies();
  }

  @Get('users')
  async getUsers(
    @Query('role') role?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getUsers(role, page, limit);
  }
}
