import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  IsUrl,
} from 'class-validator';

export class RegisterCompanyDto {
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

  @IsUrl()
  website: string;

  @IsEmail()
  companyEmail: string;

  @IsString()
  @MinLength(10)
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

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  recruiterName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  recruiterDesignation: string;

  @IsEmail()
  recruiterEmail: string;

  @IsString()
  recruiterPhone: string;
}
