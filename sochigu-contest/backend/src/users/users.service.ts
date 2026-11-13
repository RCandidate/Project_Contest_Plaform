import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  findAll(filters?: { role?: string; search?: string; name?: string }) {
    const qb = this.repo.createQueryBuilder('u');
    if (filters?.role) qb.andWhere('u.role = :role', { role: filters.role });
    if (filters?.search)
      qb.andWhere(
        '(u.email ILIKE :s OR u.lastName ILIKE :s OR u.firstName ILIKE :s OR u.middleName ILIKE :s)',
        { s: `%${filters.search}%` },
      );
    if (filters?.name)
      qb.andWhere(
        '(u.lastName ILIKE :n OR u.firstName ILIKE :n OR u.middleName ILIKE :n)',
        { n: `%${filters.name}%` },
      );
    return qb.orderBy('u.createdAt', 'DESC').getMany();
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }

  findByEmailWithPassword(email: string) {
    return this.repo
      .createQueryBuilder('u')
      .addSelect('u.password')
      .where('u.email = :email', { email })
      .getOne();
  }

  findByIdWithRefreshToken(id: string) {
    return this.repo
      .createQueryBuilder('u')
      .addSelect('u.refreshToken')
      .where('u.id = :id', { id })
      .getOne();
  }

  findByVerificationToken(token: string) {
    return this.repo
      .createQueryBuilder('u')
      .addSelect('u.emailVerificationToken')
      .where('u.emailVerificationToken = :token', { token })
      .getOne();
  }

  create(data: Partial<User>) {
    return this.repo.save(this.repo.create(data));
  }

  update(id: string, data: Partial<User>) {
    return this.repo.update(id, data);
  }

  remove(id: string) {
    return this.repo.delete(id);
  }

  updateRefreshToken(id: string, token: string | null) {
    return this.repo.update(id, { refreshToken: token });
  }

  async findPublicExperts() {
    const experts = await this.repo.find({
      where: { role: Role.EXPERT, isExpertVisible: true },
      order: { lastName: 'ASC' },
    });
    return experts.map(({ id, firstName, lastName, middleName, avatarUrl, position, bio }) =>
      ({ id, firstName, lastName, middleName, avatarUrl, position, bio })
    );
  }

  sanitize(user: User) {
    const { password, refreshToken, ...rest } = user as any;
    return rest;
  }
}
