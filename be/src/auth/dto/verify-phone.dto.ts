import { IsString, Length } from 'class-validator';

export class VerifyPhoneDto {
  @IsString()
  phone: string;

  @IsString()
  @Length(6, 6)
  otp: string;
}
