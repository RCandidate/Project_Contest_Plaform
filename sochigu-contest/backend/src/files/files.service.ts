import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppFile } from './entities/file.entity';
import { Application } from '../applications/entities/application.entity';
import { FileCategory } from '../common/enums/file-type.enum';
import * as fs from 'fs';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(AppFile) private repo: Repository<AppFile>,
    @InjectRepository(Application) private appRepo: Repository<Application>,
  ) {}

  async saveFile(
    applicationId: string,
    file: Express.Multer.File,
    category: FileCategory,
  ) {
    const MAX_FILES_TOTAL = 6;
    const existing = await this.repo.count({ where: { applicationId } });
    if (existing >= MAX_FILES_TOTAL) {
      throw new BadRequestException(`Максимум ${MAX_FILES_TOTAL} файлов на одну заявку`);
    }
    const entity = this.repo.create({
      applicationId,
      originalName: Buffer.from(file.originalname, 'latin1').toString('utf8'),
      storageName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      category,
      path: file.path,
    });
    return this.repo.save(entity);
  }

  findByApplication(applicationId: string) {
    return this.repo.find({ where: { applicationId } });
  }

  async findById(id: string) {
    const file = await this.repo.findOne({ where: { id }, relations: ['application'] });
    if (!file) throw new NotFoundException();
    return file;
  }

  async remove(id: string) {
    const file = await this.findById(id);
    try {
      await fs.promises.unlink(file.path);
    } catch (err: any) {
      if (err.code !== 'ENOENT') throw err;
    }
    return this.repo.remove(file);
  }

  findApplicationById(id: string) {
    return this.appRepo.findOne({ where: { id } });
  }
}
