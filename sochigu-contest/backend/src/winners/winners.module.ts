import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinnersController } from './winners.controller';
import { WinnersService } from './winners.service';
import { Winner } from './entities/winner.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Winner])],
  controllers: [WinnersController],
  providers: [WinnersService],
  exports: [WinnersService],
})
export class WinnersModule {}
