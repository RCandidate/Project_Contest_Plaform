import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Winner } from './entities/winner.entity';

@Injectable()
export class WinnersService {
  constructor(@InjectRepository(Winner) private repo: Repository<Winner>) {}

  findAll(filters?: { year?: number; nominationId?: string; contestId?: string }) {
    const qb = this.repo
      .createQueryBuilder('w')
      .leftJoinAndSelect('w.nomination', 'n')
      .leftJoinAndSelect('w.contest', 'c');
    if (filters?.contestId) qb.andWhere('w.contestId = :cid', { cid: filters.contestId });
    else if (filters?.year) qb.andWhere('w.year = :year', { year: filters.year });
    if (filters?.nominationId) qb.andWhere('n.id = :nid', { nid: filters.nominationId });
    return qb.orderBy('w.place', 'ASC').getMany();
  }

  getYears() {
    return this.repo
      .createQueryBuilder('w')
      .select('DISTINCT w.year', 'year')
      .orderBy('w.year', 'DESC')
      .getRawMany();
  }

  getContests() {
    return this.repo
      .createQueryBuilder('w')
      .select('c.id', 'id')
      .addSelect('c.name', 'name')
      .addSelect('c.startDate', 'startDate')
      .addSelect('c.endDate', 'endDate')
      .leftJoin('w.contest', 'c')
      .where('c.id IS NOT NULL')
      .groupBy('c.id')
      .addGroupBy('c.name')
      .addGroupBy('c.startDate')
      .addGroupBy('c.endDate')
      .orderBy('c.startDate', 'DESC')
      .getRawMany();
  }

  create(data: Partial<Winner>) {
    return this.repo.save(this.repo.create(data));
  }

  update(id: string, data: Partial<Winner>) {
    return this.repo.update(id, data);
  }

  remove(id: string) {
    return this.repo.delete(id);
  }
}
