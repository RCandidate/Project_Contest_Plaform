import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApplicationMessagesService } from "./application-messages.service";
import { CreateMessageDto } from "./dto/create-message.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Role } from "../common/enums/role.enum";
import { User } from "../users/entities/user.entity";

const UUID_PIPE = new ParseUUIDPipe({
  exceptionFactory: () => new BadRequestException("Некорректный идентификатор"),
});

// Роли, которым доступна переписка (работодатель не допускается).
// Принадлежность заявки участнику проверяется в сервисе.
@Controller("application-messages")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PARTICIPANT, Role.EXPERT, Role.MODERATOR, Role.ADMIN)
export class ApplicationMessagesController {
  constructor(private service: ApplicationMessagesService) {}

  // Статические маршруты стоят выше параметрических

  @Get("unread")
  unread(@CurrentUser() user: User) {
    return this.service.unreadMap(user);
  }

  @Get("application/:applicationId")
  findMessages(
    @Param("applicationId", UUID_PIPE) applicationId: string,
    @CurrentUser() user: User,
  ) {
    return this.service.findMessages(user, applicationId);
  }

  @Post("application/:applicationId")
  create(
    @Param("applicationId", UUID_PIPE) applicationId: string,
    @CurrentUser() user: User,
    @Body() dto: CreateMessageDto,
  ) {
    return this.service.create(user, applicationId, dto);
  }

  @Post("application/:applicationId/read")
  markRead(
    @Param("applicationId", UUID_PIPE) applicationId: string,
    @CurrentUser() user: User,
  ) {
    return this.service.markRead(user, applicationId);
  }

  @Delete(":id")
  @Roles(Role.ADMIN, Role.MODERATOR)
  remove(@Param("id", UUID_PIPE) id: string) {
    return this.service.remove(id);
  }
}
