import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contest } from './entities/contest.entity';

@Injectable()
export class ContestsService {
  constructor(@InjectRepository(Contest) private repo: Repository<Contest>) {}

  findAll() {
    return this.repo
      .createQueryBuilder('c')
      .orderBy('c.isActive', 'DESC')
      .addOrderBy('c.startDate', 'DESC')
      .getMany();
  }

  getActive() {
    return this.repo.findOne({ where: { isActive: true } });
  }

  async findById(id: string) {
    const contest = await this.repo.findOne({ where: { id } });
    if (!contest) throw new NotFoundException();
    return contest;
  }

  create(data: Partial<Contest>) {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<Contest>) {
    if (data.isActive === true) {
      await this.repo.createQueryBuilder()
        .update()
        .set({ isActive: false })
        .where('id != :id', { id })
        .execute();
    }
    return this.repo.update(id, data);
  }

  async activate(id: string) {
    await this.repo.createQueryBuilder()
      .update()
      .set({ isActive: false })
      .execute();
    await this.repo.update(id, { isActive: true });
    return this.findById(id);
  }

  remove(id: string) {
    return this.repo.delete(id);
  }
}
