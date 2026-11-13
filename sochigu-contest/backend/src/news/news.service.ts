import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from './entities/news.entity';

@Injectable()
export class NewsService {
  constructor(@InjectRepository(News) private repo: Repository<News>) {}

  findPublished(page = 1, limit = 10) {
    return this.repo.findAndCount({
      where: { isPublished: true },
      order: { publishedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findBySlug(slug: string) {
    const news = await this.repo.findOne({ where: { slug, isPublished: true } });
    if (!news) throw new NotFoundException();
    return news;
  }

  async getPinned(): Promise<News | null> {
    return this.repo.findOne({
      where: { isPinned: true, isPublished: true },
      order: { publishedAt: 'DESC' },
    });
  }

  async create(data: Partial<News>) {
    if (data.isPinned) {
      await this.repo.update({ isPinned: true }, { isPinned: false });
    }
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<News>) {
    if (data.isPinned) {
      await this.repo.update({ isPinned: true }, { isPinned: false });
    }
    return this.repo.update(id, data);
  }

  remove(id: string) {
    return this.repo.delete(id);
  }
}