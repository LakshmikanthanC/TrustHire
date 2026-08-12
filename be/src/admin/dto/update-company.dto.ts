import { PartialType, OmitType } from '@nestjs/mapped-types';
import { AdminCreateCompanyDto, AdminCreateJobDto } from './create-company.dto';

export class UpdateCompanyDto extends PartialType(
  OmitType(AdminCreateCompanyDto, ['registrationNumber', 'job'] as const),
) {}

export class UpdateJobDto extends PartialType(AdminCreateJobDto) {}
