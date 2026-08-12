import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  IsEnum,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { JobType } from '@prisma/client';

export class CreateJobDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(50)
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
  @IsInt()
  @Min(0)
  salaryMin?: number;

  @IsOptional()
  @IsInt()
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
