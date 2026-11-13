import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { NominationsModule } from './nominations/nominations.module';
import { ApplicationsModule } from './applications/applications.module';
import { FilesModule } from './files/files.module';
import { NewsModule } from './news/news.module';
import { DocumentsModule } from './documents/documents.module';
import { WinnersModule } from './winners/winners.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { MailModule } from './mail/mail.module';
import { ContactsModule } from './contacts/contacts.module';
import { ContestsModule } from './contests/contests.module';
import { BankModule } from "./bank/bank.module";
import { ScoresModule } from "./scores/scores.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: databaseConfig,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "uploads"),
      serveRoot: "/uploads",
    }),
    AuthModule,
    UsersModule,
    NominationsModule,
    ApplicationsModule,
    FilesModule,
    NewsModule,
    DocumentsModule,
    WinnersModule,
    AnalyticsModule,
    MailModule,
    ContactsModule,
    ContestsModule,
    ContestsModule,
    BankModule,
    ScoresModule,
  ],
})
export class AppModule {}
