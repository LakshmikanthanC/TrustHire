import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  jobId: string;

  @IsOptional()
  @IsString()
  resume?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  coverLetter?: string;
}
