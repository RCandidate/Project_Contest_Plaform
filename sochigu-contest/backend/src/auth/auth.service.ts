import {
  Injectable,
  Logger,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email уже зарегистрирован');

    const hashed = await bcrypt.hash(dto.password, 10);

    if (!this.mailService.isReady) {
      await this.usersService.create({
        ...dto,
        password: hashed,
        isEmailVerified: true,
        emailVerificationToken: null,
      });
      return { message: 'Регистрация успешна. Войдите в систему.' };
    }

    const token = randomBytes(32).toString('hex');
    const user = await this.usersService.create({
      ...dto,
      password: hashed,
      isEmailVerified: false,
      emailVerificationToken: token,
    });
    this.mailService.sendEmailVerification({ email: user.email, firstName: user.firstName }, token)
      .catch(err => this.logger.warn(`Verification email failed: ${err.message}`));
    return { message: 'Письмо с подтверждением отправлено на ваш email' };
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) throw new BadRequestException('Неверная или устаревшая ссылка подтверждения');
    await this.usersService.update(user.id, { isEmailVerified: true, emailVerificationToken: null });
    return { message: 'Email подтверждён. Теперь вы можете войти в систему.' };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    if (!user) throw new UnauthorizedException('Неверный email или пароль');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Неверный email или пароль');

    if (!user.isActive) throw new UnauthorizedException('Аккаунт заблокирован');
    if (!user.isEmailVerified) throw new UnauthorizedException('Подтвердите email. Письмо было отправлено при регистрации.');

    return this.generateTokens(user);
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.usersService.findByIdWithRefreshToken(userId);
    if (!user || !user.refreshToken) throw new UnauthorizedException();

    const valid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!valid) throw new UnauthorizedException();

    if (!user.isActive) throw new UnauthorizedException('Аккаунт заблокирован');

    return this.generateTokens(user);
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
  }

  private async generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.usersService.updateRefreshToken(user.id, hashed);

    return { accessToken, refreshToken, user: this.usersService.sanitize(user) };
  }
}
