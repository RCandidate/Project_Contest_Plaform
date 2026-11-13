import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Application } from './entities/application.entity';
import { ApplicationLog } from './entities/application-log.entity';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ApplicationStatus } from '../common/enums/application-status.enum';
import { MailService } from '../mail/mail.service';
import { FilesService } from '../files/files.service';
import { ContestsService } from '../contests/contests.service';

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    @InjectRepository(Application) private repo: Repository<Application>,
    @InjectRepository(ApplicationLog) private logRepo: Repository<ApplicationLog>,
    private mailService: MailService,
    private filesService: FilesService,
    private contestsService: ContestsService,
  ) {}

  async create(userId: string, dto: CreateApplicationDto) {
    const activeContest = await this.contestsService.getActive();
    const app = this.repo.create({
      ...dto,
      userId,
      contestId: activeContest?.id ?? null,
    });
    return this.repo.save(app);
  }

  findByUser(userId: string) {
    return this.repo.find({
      where: { userId },
      relations: ['nomination', 'files', 'logs'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string, userId?: string) {
    const app = await this.repo.findOne({
      where: { id },
      relations: ['nomination', 'files', 'logs', 'user'],
    });
    if (!app) throw new NotFoundException();
    if (userId && app.userId !== userId) throw new ForbiddenException();
    return app;
  }

  async findAll(filters: {
    nominationId?: string;
    status?: ApplicationStatus;
    university?: string;
    search?: string;
    contestId?: string;
    page?: number;
    limit?: number;
  }) {
    const { page = 1, limit = 20, ...rest } = filters;
    const qb = this.repo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.nomination', 'n')
      .leftJoinAndSelect('a.user', 'u')
      .leftJoinAndSelect('a.files', 'f');

    if (rest.nominationId) qb.andWhere('a.nominationId = :nid', { nid: rest.nominationId });
    if (rest.status) qb.andWhere('a.status = :status', { status: rest.status });
    if (rest.university) qb.andWhere('u.university ILIKE :uni', { uni: `%${rest.university}%` });
    if (rest.search) qb.andWhere('a.projectTitle ILIKE :s', { s: `%${rest.search}%` });
    if (rest.contestId) qb.andWhere('a.contestId = :cid', { cid: rest.contestId });

    const [data, total] = await qb
      .orderBy('a.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  async update(id: string, userId: string, data: { projectTitle?: string; projectDescription?: string; keywords?: string[]; teamMembers?: Application['teamMembers']; supervisor?: Application['supervisor']; nominationId?: string }) {
    const app = await this.findById(id, userId);
    if (app.status !== ApplicationStatus.DRAFT)
      throw new ForbiddenException('Редактирование недоступно после подачи заявки');
    if (data.projectTitle !== undefined) app.projectTitle = data.projectTitle;
    if (data.projectDescription !== undefined) app.projectDescription = data.projectDescription;
    if (data.keywords !== undefined) app.keywords = data.keywords;
    if (data.teamMembers !== undefined) app.teamMembers = data.teamMembers;
    if (data.supervisor !== undefined) app.supervisor = data.supervisor;
    if (data.nominationId !== undefined) app.nominationId = data.nominationId;
    return this.repo.save(app);
  }

  async submit(id: string, userId: string) {
    const app = await this.findById(id, userId);
    if (app.status !== ApplicationStatus.DRAFT)
      throw new ForbiddenException('Подать можно только черновик');
    const prev = app.status;
    app.status = ApplicationStatus.SUBMITTED;
    app.submittedAt = new Date();
    await this.repo.save(app);
    await this.logStatusChange(app.id, userId, prev, ApplicationStatus.SUBMITTED);
    return app;
  }

  async updateStatus(id: string, adminId: string, dto: UpdateStatusDto) {
    const app = await this.findById(id);
    const prev = app.status;
    app.status = dto.status;
    app.adminComment = dto.comment || app.adminComment;
    await this.repo.save(app);
    await this.logStatusChange(app.id, adminId, prev, dto.status, dto.comment);
    this.mailService.sendStatusUpdate(app).catch(err => this.logger.error('Ошибка отправки письма об изменении статуса:', err));
    return this.findById(id);
  }

  async exportToExcel(filters: any): Promise<ArrayBuffer> {
    const { data: applications } = await this.findAll({ ...filters, limit: 10000, page: 1 });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Заявки');

    sheet.columns = [
      { header: '№', key: 'num', width: 5 },
      { header: 'Название проекта', key: 'title', width: 40 },
      { header: 'ФИО', key: 'fio', width: 30 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Вуз', key: 'university', width: 30 },
      { header: 'Номинация', key: 'nomination', width: 20 },
      { header: 'Статус', key: 'status', width: 15 },
      { header: 'Дата подачи', key: 'submittedAt', width: 20 },
    ];

    const statusLabels: Record<string, string> = {
      draft: 'Черновик', submitted: 'На проверке', accepted: 'Принята',
      rejected: 'Отклонена', admitted: 'Допущена', winner: 'Победитель', runner_up: 'Призёр',
    };

    applications.forEach((app, i) => {
      sheet.addRow({
        num: i + 1,
        title: app.projectTitle,
        fio: app.user ? `${app.user.lastName} ${app.user.firstName}` : '',
        email: app.user?.email,
        university: app.user?.university,
        nomination: app.nomination?.name,
        status: statusLabels[app.status],
        submittedAt: app.submittedAt ? new Date(app.submittedAt).toLocaleDateString('ru-RU') : '',
      });
    });

    return workbook.xlsx.writeBuffer();
  }

  async delete(id: string, userId: string) {
    const app = await this.findById(id, userId);
    if (app.status !== ApplicationStatus.DRAFT)
      throw new ForbiddenException('Удалить можно только черновик');
    for (const file of app.files ?? []) {
      await this.filesService.remove(file.id);
    }
    await this.repo.remove(app);
  }

  async withdraw(id: string, userId: string) {
    const app = await this.findById(id, userId);
    if (app.status !== ApplicationStatus.SUBMITTED)
      throw new ForbiddenException('Отозвать можно только поданную заявку');
    const prev = app.status;
    app.status = ApplicationStatus.DRAFT;
    app.submittedAt = null;
    await this.repo.save(app);
    await this.logStatusChange(app.id, userId, prev, ApplicationStatus.DRAFT);
    return app;
  }

  private async logStatusChange(
    applicationId: string,
    changedById: string,
    fromStatus: ApplicationStatus,
    toStatus: ApplicationStatus,
    comment?: string,
  ) {
    const log = this.logRepo.create({ applicationId, changedById, fromStatus, toStatus, comment });
    return this.logRepo.save(log);
  }
}
