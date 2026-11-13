import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null;

  constructor(private configService: ConfigService) {
    if (!configService.get('SMTP_HOST')) {
      this.logger.warn('SMTP not configured, emails will be skipped');
      this.transporter = null;
    } else {
      this.transporter = nodemailer.createTransport({
        host: configService.get('SMTP_HOST'),
        port: configService.get<number>('SMTP_PORT', 465),
        secure: true,
        auth: {
          user: configService.get('SMTP_USER'),
          pass: configService.get('SMTP_PASS'),
        },
      });
    }
  }

  get isReady(): boolean {
    return this.transporter !== null;
  }

  async sendWelcome(user: { email: string; firstName: string }) {
    if (!this.transporter) return;
    await this.transporter.sendMail({
      from: `"Конкурс СочиГУ" <${this.configService.get('SMTP_USER')}>`,
      to: user.email,
      subject: 'Добро пожаловать на конкурс проектов СочиГУ!',
      html: `
        <h2>Здравствуйте, ${escapeHtml(user.firstName)}!</h2>
        <p>Вы успешно зарегистрировались на платформе конкурса студенческих проектов СочиГУ.</p>
        <p>Теперь вы можете подать заявку на участие в конкурсе.</p>
        <p><a href="${this.configService.get('FRONTEND_URL')}/cabinet">Перейти в личный кабинет</a></p>
        <p>Организатор — Стартап-студия СочиГУ</p>
      `,
    });
  }

  async sendEmailVerification(user: { email: string; firstName: string }, token: string) {
    if (!this.transporter) return;
    const url = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`;
    await this.transporter.sendMail({
      from: `"Конкурс СочиГУ" <${this.configService.get('SMTP_USER')}>`,
      to: user.email,
      subject: 'Подтвердите ваш email — Конкурс СочиГУ',
      html: `
        <h2>Здравствуйте, ${escapeHtml(user.firstName)}!</h2>
        <p>Для завершения регистрации подтвердите ваш email:</p>
        <p>
          <a href="${url}" style="display:inline-block;padding:12px 24px;background:#6C464F;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
            Подтвердить email
          </a>
        </p>
        <p style="color:#999;font-size:12px;">Ссылка действительна 24 часа. Если вы не регистрировались — проигнорируйте это письмо.</p>
      `,
    });
  }

  async sendStatusUpdate(application: any) {
    if (!this.transporter) return;
    if (!application?.user?.email) return;

    const statusLabels: Record<string, string> = {
      submitted: 'На проверке',
      accepted: 'Принята',
      rejected: 'Отклонена',
      admitted: 'Допущена к очному этапу',
      winner: 'Победитель',
      runner_up: 'Призёр',
    };

    await this.transporter.sendMail({
      from: `"Конкурс СочиГУ" <${this.configService.get('SMTP_USER')}>`,
      to: application.user.email,
      subject: `Статус заявки изменён — ${statusLabels[application.status] || application.status}`,
      html: `
        <h2>Статус вашей заявки изменён</h2>
        <p>Проект: <strong>${escapeHtml(application.projectTitle)}</strong></p>
        <p>Новый статус: <strong>${statusLabels[application.status] ?? application.status}</strong></p>
        ${application.adminComment ? `<p>Комментарий: ${escapeHtml(application.adminComment)}</p>` : ''}
        <p><a href="${this.configService.get('FRONTEND_URL')}/cabinet">Перейти в личный кабинет</a></p>
      `,
    });
  }
}
