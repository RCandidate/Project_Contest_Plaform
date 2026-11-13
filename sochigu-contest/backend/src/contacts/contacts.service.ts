import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from './entities/contact-message.entity';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { UpdateContactStatusDto } from './dto/update-contact-status.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(ContactMessage)
    private repo: Repository<ContactMessage>,
  ) {}

  create(dto: CreateContactMessageDto) {
    const msg = this.repo.create(dto);
    return this.repo.save(msg);
  }

  findAll(status?: string) {
    const where = status ? { status: status as 'pending' | 'done' } : {};
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }

  async findById(id: string) {
    const msg = await this.repo.findOne({ where: { id } });
    if (!msg) throw new NotFoundException();
    return msg;
  }

  async updateStatus(id: string, dto: UpdateContactStatusDto) {
    const msg = await this.findById(id);
    msg.status = dto.status;
    return this.repo.save(msg);
  }
}
