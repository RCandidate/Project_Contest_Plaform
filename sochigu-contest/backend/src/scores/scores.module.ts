import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScoresController } from "./scores.controller";
import { ScoresService } from "./scores.service";
import { Score } from "./entities/score.entity";
import { Application } from "../applications/entities/application.entity";
import { User } from "../users/entities/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Score, Application, User])],
  controllers: [ScoresController],
  providers: [ScoresService],
})
export class ScoresModule {}
