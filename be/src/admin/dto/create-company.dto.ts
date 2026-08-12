import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  IsArray,
  IsInt,
  IsNumber,
  Min,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { JobType } from '@prisma/client';

export class AdminCreateJobDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  responsibilities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @IsArray()
  @IsString({ each: true })
  skills: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMax?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  experienceMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  experienceMax?: number;

  @IsString()
  location: string;

  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;

  @IsOptional()
  @IsInt()
  @Min(1)
  vacancies?: number;

  @IsOptional()
  @IsDateString()
  deadline?: string;
}

export class AdminCreateCompanyDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @IsString()
  registrationNumber: string;

  @IsOptional()
  @IsString()
  gstNumber?: string;

  @IsOptional()
  @IsString()
  pan?: string;

  @IsOptional()
  @IsString()
  website: string;

  @IsEmail()
  companyEmail: string;

  @IsString()
  address: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  pincode: string;

  @IsOptional()
  @IsString()
  linkedin?: string;

  @IsOptional()
  job?: AdminCreateJobDto;
}
