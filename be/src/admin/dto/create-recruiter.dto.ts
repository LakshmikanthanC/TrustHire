import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
} from 'class-validator';

export class AdminCreateRecruiterDto {
  @IsString()
  companyId: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password: string;

  @IsString()
  phone: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  designation: string;
}
