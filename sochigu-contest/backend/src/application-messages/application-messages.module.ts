import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApplicationMessagesController } from "./application-messages.controller";
import { ApplicationMessagesService } from "./application-messages.service";
import { ApplicationMessage } from "./entities/application-message.entity";
import { ApplicationThreadRead } from "./entities/application-thread-read.entity";
import { Application } from "../applications/entities/application.entity";
import { User } from "../users/entities/user.entity";
import { MailModule } from "../mail/mail.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApplicationMessage,
      ApplicationThreadRead,
      Application,
      User,
    ]),
    MailModule,
  ],
  controllers: [ApplicationMessagesController],
  providers: [ApplicationMessagesService],
  exports: [ApplicationMessagesService],
})
export class ApplicationMessagesModule {}
