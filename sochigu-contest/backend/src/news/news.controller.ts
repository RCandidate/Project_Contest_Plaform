// eslint-disable-next-line @typescript-eslint/no-var-requires
const heicConvert = require('heic-convert');

import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, BadRequestException, Res, OnModuleInit } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { resolve, sep } from 'path';
import { Response } from 'express';
import { v4 as uuid } from 'uuid';
import * as fs from 'fs';
import { NewsService } from './news.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

const PHOTO_DIR = resolve(__dirname, '../../uploads/news');

@Controller('news')
export class NewsController implements OnModuleInit {
  constructor(private newsService: NewsService) {}

  onModuleInit() {
    fs.mkdirSync(PHOTO_DIR, { recursive: true });
  }

  @Get()
  findPublished(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.newsService.findPublished(+page, +limit);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  findAll() {
    return this.newsService.findAll();
  }

  @Post('upload-photo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
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
    return { url: `/api/news/photo/${filename}` };
  }

  @Get('photo/:filename')
  servePhoto(@Param('filename') filename: string, @Res() res: Response) {
    const safePath = resolve(PHOTO_DIR, filename);
    if (!safePath.startsWith(PHOTO_DIR + sep)) {
      throw new BadRequestException('Invalid filename');
    }
    res.sendFile(safePath);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.newsService.findBySlug(slug);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  create(@Body() body: any) {
    return this.newsService.create(body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  update(@Param('id') id: string, @Body() body: any) {
    return this.newsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.newsService.remove(id);
  }
  @Get('pinned')
  getPinned() {
    return this.newsService.getPinned(); // добавил закреп новости
}
}
