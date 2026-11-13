import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';

@Injectable()
export class DocumentsService {
  constructor(@InjectRepository(Document) private repo: Repository<Document>) {}

  findPublished() {
    return this.repo.find({ where: { isPublished: true }, order: { sortOrder: 'ASC', createdAt: 'DESC' } });
  }

  findAll() {
    return this.repo.find({ order: { sortOrder: 'ASC' } });
  }

  findOne(id: string) {
    return this.repo.findOneOrFail({ where: { id } });
  }

  create(data: Partial<Document>) {
    return this.repo.save(this.repo.create(data));
  }

  update(id: string, data: Partial<Document>) {
    return this.repo.update(id, data);
  }

  remove(id: string) {
    return this.repo.delete(id);
  }
}
