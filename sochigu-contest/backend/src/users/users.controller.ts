// eslint-disable-next-line @typescript-eslint/no-var-requires
const heicConvert = require('heic-convert');

import * as bcrypt from 'bcrypt';
import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query, UseInterceptors, UploadedFile, BadRequestException, ConflictException, Res, OnModuleInit } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { resolve, sep } from 'path';
import { Response } from 'express';
import { v4 as uuid } from 'uuid';
import * as fs from 'fs';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';
import { UpdateRoleDto } from './dto/update-role.dto';

const PHOTO_DIR = resolve(__dirname, '../../uploads/experts');

@Controller('users')
export class UsersController implements OnModuleInit {
  constructor(private usersService: UsersService) {}

  onModuleInit() {
    fs.mkdirSync(PHOTO_DIR, { recursive: true });
  }

  @Post('create-expert')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createExpert(@Body() body: any) {
    const { email, password, firstName, lastName, middleName, phone,
            university, faculty, department, city, position, bio } = body;
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new ConflictException('Email уже зарегистрирован');
    const hashed = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      email, password: hashed, firstName, lastName, middleName,
      phone, university, faculty, department, city, position, bio,
      role: Role.EXPERT,
    });
    return this.usersService.sanitize(user);
  }

  /** Публичный эндпоинт — только видимые эксперты, только публичные поля */
  @Get('experts')
  getPublicExperts() {
    return this.usersService.findPublicExperts();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser() user: any) {
    return this.usersService.sanitize(user);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(@CurrentUser('id') id: string, @Body() body: any) {
    const { firstName, lastName, middleName, phone, university, faculty, department, course, city } = body;
    return this.usersService.update(id, { firstName, lastName, middleName, phone, university, faculty, department, course, city });
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  getAll(
    @Query('role') role?: string,
    @Query('search') search?: string,
    @Query('name') name?: string,
  ) {
    return this.usersService.findAll({ role, search, name });
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateRole(@Param('id') id: string, @Body() body: UpdateRoleDto) {
    return this.usersService.update(id, { role: body.role });
  }

  @Patch(':id/expert-profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateExpertProfile(@Param('id') id: string, @Body() body: any) {
    const { avatarUrl, position, bio, isExpertVisible } = body;
    return this.usersService.update(id, { avatarUrl, position, bio, isExpertVisible });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  removeUser(@Param('id') id: string, @CurrentUser('id') currentId: string) {
    if (id === currentId) throw new BadRequestException('Нельзя удалить собственный аккаунт');
    return this.usersService.remove(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  updateUser(@Param('id') id: string, @Body() body: any) {
    const { firstName, lastName, middleName, phone, university, faculty, department, city, isActive } = body;
    return this.usersService.update(id, { firstName, lastName, middleName, phone, university, faculty, department, city, isActive });
  }

  @Post('upload-photo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }))
  async uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Файл не получен');

    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
    const allowedExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'];
    const ext = (file.originalname.split('.').pop() ?? '').toLowerCase();
    if (!allowedMimes.includes(file.mimetype) && !allowedExts.includes(ext)) {
      throw new BadRequestException('Разрешены только изображения (JPEG, PNG, GIF, WebP, HEIC)');
    }

    let buffer = file.buffer;
    let filename: string;

    if (file.mimetype === 'image/heic' || file.mimetype === 'image/heif' || ext === 'heic' || ext === 'heif') {
      const converted = await heicConvert({ buffer: file.buffer, format: 'JPEG', quality: 0.9 });
      buffer = Buffer.from(converted);
      filename = `${uuid()}.jpg`;
    } else {
      filename = `${uuid()}.${ext}`;
    }

    await fs.promises.writeFile(resolve(PHOTO_DIR, filename), buffer);
    return { url: `/api/users/photo/${filename}` };
  }

  @Get('photo/:filename')
  servePhoto(@Param('filename') filename: string, @Res() res: Response) {
    const safePath = resolve(PHOTO_DIR, filename);
    if (!safePath.startsWith(PHOTO_DIR + sep)) {
      throw new BadRequestException('Invalid filename');
    }
    res.sendFile(safePath, err => { if (err) res.status(404).json({ statusCode: 404, message: 'Not found' }); });
  }
}
