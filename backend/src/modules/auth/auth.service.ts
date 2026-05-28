import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import { LoginDto } from './dto/login.dto';
import { RegisterDto, ForgotPasswordDto, ResetPasswordDto } from './dto/register.dto';
import { generateSecureToken, hashString } from '../../common/utils/crypto.util';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password, twoFactorCode } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email, deletedAt: null },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Conta desativada. Contate o administrador.');
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return {
          requiresTwoFactor: true,
          message: 'Código 2FA necessário',
        };
      }

      const isValid = authenticator.verify({
        token: twoFactorCode,
        secret: user.twoFactorSecret,
      });

      if (!isValid) {
        throw new UnauthorizedException('Código 2FA inválido');
      }
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        refreshToken: await bcrypt.hash(tokens.refreshToken, 10),
      },
    });

    const { password: _, twoFactorSecret: __, refreshToken: ___, ...userResponse } = user;

    return {
      user: userResponse,
      ...tokens,
    };
  }

  async register(registerDto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existing) {
      throw new ConflictException('Email já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        name: registerDto.name,
        email: registerDto.email,
        password: hashedPassword,
        phone: registerDto.phone,
        role: registerDto.role || 'ANALYST',
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await bcrypt.hash(tokens.refreshToken, 10) },
    });

    const { password: _, ...userResponse } = user;
    return { user: userResponse, ...tokens };
  }

  async refreshTokens(userId: string, email: string, role: string) {
    const tokens = await this.generateTokens(userId, email, role);

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: await bcrypt.hash(tokens.refreshToken, 10) },
    });

    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: 'Logout realizado com sucesso' };
  }

  async setup2FA(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(
      user.email,
      this.configService.get('TWO_FACTOR_APP_NAME', 'SistemaLicitacao'),
      secret,
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret },
    });

    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

    return { secret, qrCodeUrl };
  }

  async enable2FA(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('Configure o 2FA primeiro');
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      throw new BadRequestException('Código 2FA inválido');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    return { message: '2FA ativado com sucesso' };
  }

  async disable2FA(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorEnabled) {
      throw new BadRequestException('2FA não está ativado');
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      throw new BadRequestException('Código 2FA inválido');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });

    return { message: '2FA desativado com sucesso' };
  }

  async forgotPassword(forgotDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotDto.email, deletedAt: null },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'Se o email existir, você receberá as instruções.' };
    }

    const token = generateSecureToken();
    const hashedToken = hashString(token);

    // Store reset token (in production, use a dedicated table)
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: hashedToken, // Reusing field for demo; use dedicated field in production
      },
    });

    // In production, send email here
    return {
      message: 'Se o email existir, você receberá as instruções.',
      ...(this.configService.get('NODE_ENV') !== 'production' ? { token } : {}),
    };
  }

  async resetPassword(resetDto: ResetPasswordDto) {
    const hashedToken = hashString(resetDto.token);

    const user = await this.prisma.user.findFirst({
      where: { refreshToken: hashedToken },
    });

    if (!user) {
      throw new BadRequestException('Token inválido ou expirado');
    }

    const hashedPassword = await bcrypt.hash(resetDto.password, 12);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, refreshToken: null },
    });

    return { message: 'Senha alterada com sucesso' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        isActive: true,
        twoFactorEnabled: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET', 'fallback-secret'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET', 'fallback-refresh-secret'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
