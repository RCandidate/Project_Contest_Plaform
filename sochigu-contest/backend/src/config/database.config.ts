import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Nomination } from '../nominations/entities/nomination.entity';
import { Application } from '../applications/entities/application.entity';
import { ApplicationLog } from '../applications/entities/application-log.entity';
import { AppFile } from '../files/entities/file.entity';
import { News } from '../news/entities/news.entity';
import { Document } from '../documents/entities/document.entity';
import { Winner } from '../winners/entities/winner.entity';
import { ContactMessage } from '../contacts/entities/contact-message.entity';
import { Contest } from '../contests/entities/contest.entity';

export const databaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get('DB_USER', 'sochigu'),
  password: configService.get('DB_PASS', 'sochigu_pass'),
  database: configService.get('DB_NAME', 'sochigu_contest'),
  entities: [User, Nomination, Application, ApplicationLog, AppFile, News, Document, Winner, ContactMessage, Contest],
  synchronize: String(configService.get('DB_SYNCHRONIZE', 'false')).trim().toLowerCase() === 'true',
  logging: configService.get('NODE_ENV') === 'development',
  migrations: ['dist/database/migrations/*.js'],
});
