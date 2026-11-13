import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BankController } from "./bank.controller";
import { BankService } from "./bank.service";
import { BankTopic } from "./entities/bank-topic.entity";
import { BankOffer } from "./entities/bank-offer.entity";
import { BankComment } from "./entities/bank-comment.entity";
import { Application } from "../applications/entities/application.entity";

@Module({
  imports: [TypeOrmModule.forFeature([BankTopic, BankOffer, BankComment, Application])],
  controllers: [BankController],
  providers: [BankService],
})
export class BankModule {}
