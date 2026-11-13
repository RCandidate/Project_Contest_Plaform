import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nomination } from './entities/nomination.entity';

@Injectable()
export class NominationsService {
  constructor(@InjectRepository(Nomination) private repo: Repository<Nomination>) {}

  findAll() {
    return this.repo.find({ where: { isActive: true }, order: { sortOrder: 'ASC' } });
  }

  findAllAdmin() {
    return this.repo.find({ order: { sortOrder: 'ASC' } });
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Partial<Nomination>) {
    return this.repo.save(this.repo.create(data));
  }

  update(id: string, data: Partial<Nomination>) {
    return this.repo.update(id, data);
  }

  remove(id: string) {
    return this.repo.delete(id);
  }
}
