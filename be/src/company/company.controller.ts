import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  UploadedFiles,
  NotFoundException,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Public()
  @Get()
  async listCompanies(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.companyService.listApprovedCompanies(page, limit);
  }

  @Public()
  @Get(':id')
  async getCompanyById(@Param('id') id: string) {
    return this.companyService.getProfile(id);
  }

  @Post('register')
  async register(
    @Body() dto: RegisterCompanyDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.companyService.register(dto, userId);
  }

  @Get('profile')
  async getProfile(@CurrentUser('id') userId: string) {
    const company = await this.companyService.getRecruiterCompany(userId);
    if (!company) return null;
    return this.companyService.getProfile(company.id);
  }

  @Get('status')
  async getStatus(@CurrentUser('id') userId: string) {
    const company = await this.companyService.getRecruiterCompany(userId);
    if (!company) return null;
    return this.companyService.getStatus(company.id);
  }

  @Put('profile')
  async updateProfile(
    @Body() dto: UpdateCompanyDto,
    @CurrentUser('id') userId: string,
  ) {
    const company = await this.companyService.getRecruiterCompany(userId);
    if (!company) {
      throw new NotFoundException('No company registered. Please register a company first.');
    }
    return this.companyService.updateProfile(company.id, dto);
  }

  @Post('upload-documents')
  async uploadDocuments(
    @UploadedFiles() files: string[],
    @CurrentUser('id') userId: string,
  ) {
    const company = await this.companyService.getRecruiterCompany(userId);
    if (!company) {
      throw new NotFoundException('No company registered. Please register a company first.');
    }
    return this.companyService.uploadDocuments(company.id, files);
  }
}
