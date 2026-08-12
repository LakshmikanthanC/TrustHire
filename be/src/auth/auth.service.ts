import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyPhoneDto } from './dto/verify-phone.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuditAction } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private otpStore = new Map<string, { otp: string; expiresAt: Date }>();

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const { email, phone, password, name, role } = dto;

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Email already registered');
      }
      throw new ConflictException('Phone number already registered');
    }

    const hashedPassword = await argon2.hash(password);

    const user = await this.prisma.user.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        name,
        role: role || 'CANDIDATE',
      },
    });

    await this.sendEmailOtp(email);
    await this.sendPhoneOtp(phone);

    await this.createAuditLog(user.id, null, AuditAction.REGISTER, {
      email,
      role: role || 'CANDIDATE',
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        verificationStatus: user.verificationStatus,
      },
    };
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated. Contact support.');
    }

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      await this.createAuditLog(
        user.id,
        null,
        AuditAction.SUSPICIOUS_ACTIVITY,
        { reason: 'Failed login attempt', ipAddress, userAgent },
      );
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    await this.createAuditLog(user.id, null, AuditAction.LOGIN, {
      ipAddress,
      userAgent,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        verificationStatus: user.verificationStatus,
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Refresh token has been revoked');
      }

      const tokens = await this.generateTokens(user.id, user.email, user.role);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: 'Logged out successfully' };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const { email, otp } = dto;
    const storedOtp = this.getOtp(email);

    if (!storedOtp || storedOtp.otp !== otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    if (new Date() > storedOtp.expiresAt) {
      this.otpStore.delete(email);
      throw new BadRequestException('OTP has expired. Request a new one.');
    }

    this.otpStore.delete(email);

    const user = await this.prisma.user.findUnique({ where: { email } });
    let newStatus: string = 'EMAIL_VERIFIED';
    if (user?.phoneVerifiedAt) {
      newStatus = 'FULLY_VERIFIED';
    }

    await this.prisma.user.update({
      where: { email },
      data: {
        emailVerifiedAt: new Date(),
        verificationStatus: newStatus as any,
      },
    });

    return { message: 'Email verified successfully' };
  }

  async verifyPhone(dto: VerifyPhoneDto) {
    const { phone, otp } = dto;
    const storedOtp = this.getOtp(phone);

    if (!storedOtp || storedOtp.otp !== otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    if (new Date() > storedOtp.expiresAt) {
      this.otpStore.delete(phone);
      throw new BadRequestException('OTP has expired. Request a new one.');
    }

    this.otpStore.delete(phone);

    const user = await this.prisma.user.findFirst({ where: { phone } });
    let newStatus: string = 'PHONE_VERIFIED';
    if (user?.emailVerifiedAt) {
      newStatus = 'FULLY_VERIFIED';
    }

    await this.prisma.user.update({
      where: { phone },
      data: {
        phoneVerifiedAt: new Date(),
        verificationStatus: newStatus as any,
      },
    });

    return { message: 'Phone verified successfully' };
  }

  async resendOtp(emailOrPhone: string) {
    const isEmail = emailOrPhone.includes('@');
    if (isEmail) {
      await this.sendEmailOtp(emailOrPhone);
    } else {
      await this.sendPhoneOtp(emailOrPhone);
    }
    return { message: 'OTP resent successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        verificationStatus: true,
        resume: true,
        skills: true,
        experience: true,
        education: true,
        bio: true,
        profilePicture: true,
        linkedin: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.resume !== undefined && { resume: dto.resume }),
        ...(dto.skills !== undefined && { skills: dto.skills }),
        ...(dto.experience !== undefined && { experience: dto.experience }),
        ...(dto.education !== undefined && { education: dto.education }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.linkedin !== undefined && { linkedin: dto.linkedin }),
        ...(dto.profilePicture !== undefined && { profilePicture: dto.profilePicture }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        verificationStatus: true,
        resume: true,
        skills: true,
        experience: true,
        education: true,
        bio: true,
        profilePicture: true,
        linkedin: true,
        createdAt: true,
      },
    });

    await this.createAuditLog(userId, null, AuditAction.PROFILE_UPDATE, {
      updatedFields: Object.keys(dto),
    });

    return updated;
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async sendEmailOtp(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpStore.set(email, {
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    this.logger.log(`Email OTP for ${email}: ${otp}`);
    return otp;
  }

  private async sendPhoneOtp(phone: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpStore.set(phone, {
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    this.logger.log(`Phone OTP for ${phone}: ${otp}`);
    return otp;
  }

  private getOtp(key: string) {
    return this.otpStore.get(key);
  }

  private async createAuditLog(
    userId: string | null,
    companyId: string | null,
    action: AuditAction,
    details: any,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId,
          companyId,
          action,
          details: JSON.stringify(details),
          metadata: details,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
    }
  }
}
