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
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { SearchJobDto } from './dto/search-job.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '@prisma/client';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobController {
  constructor(private jobService: JobService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.RECRUITER)
  async create(
    @Body() dto: CreateJobDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.jobService.create(dto, userId);
  }

  @Public()
  @Get()
  async findAll(@Query() query: SearchJobDto) {
    return this.jobService.findAll(query);
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RECRUITER)
  async getMyJobs(@CurrentUser('id') userId: string) {
    return this.jobService.getMyJobs(userId);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.jobService.findOne(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RECRUITER)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateJobDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.jobService.update(id, dto, userId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.RECRUITER)
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.jobService.remove(id, userId);
  }
}
