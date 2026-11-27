import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScoresController } from "./scores.controller";
import { ScoresService } from "./scores.service";
import { FinalScoresController } from "./final-scores.controller";
import { FinalScoresService } from "./final-scores.service";
import { Score } from "./entities/score.entity";
import { Application } from "../applications/entities/application.entity";
import { User } from "../users/entities/user.entity";
import { FinalScore } from "./entities/final-score.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Score, FinalScore, Application, User])],
  controllers: [ScoresController, FinalScoresController],
  providers: [ScoresService, FinalScoresService],
})
export class ScoresModule {}
