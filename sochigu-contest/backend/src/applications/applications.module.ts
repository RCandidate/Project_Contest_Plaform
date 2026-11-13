import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { Application } from './entities/application.entity';
import { ApplicationLog } from './entities/application-log.entity';
import { MailModule } from '../mail/mail.module';
import { FilesModule } from '../files/files.module';
import { ContestsModule } from '../contests/contests.module';

@Module({
  imports: [TypeOrmModule.forFeature([Application, ApplicationLog]), MailModule, FilesModule, ContestsModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
