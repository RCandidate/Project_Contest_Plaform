import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Application } from '../applications/entities/application.entity';
import { User } from '../users/entities/user.entity';
import { ApplicationLog } from '../applications/entities/application-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Application, User, ApplicationLog])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
