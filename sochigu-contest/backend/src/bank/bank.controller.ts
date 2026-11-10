import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { BankService } from "./bank.service";
import { GetBankProjectsDto } from "./dto/get-bank-projects.dto";
import { GetBankTopicsDto } from "./dto/get-bank-topics.dto";
import { GetBankOffersDto } from "./dto/get-bank-offers.dto";
import { CreateTopicDto } from "./dto/create-topic.dto";
import { UpdateTopicDto } from "./dto/update-topic.dto";
import { UpdateTopicStatusDto } from "./dto/update-topic-status.dto";
import { CreateOfferDto } from "./dto/create-offer.dto";
import { UpdateOfferStatusDto } from "./dto/update-offer-status.dto";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Role } from "../common/enums/role.enum";
import { User } from "../users/entities/user.entity";

const UUID_PIPE = new ParseUUIDPipe({
  exceptionFactory: () => new BadRequestException("Некорректный идентификатор"),
});

@Controller("bank")
export class BankController {
  constructor(private service: BankService) {}

  // ─── Публичные ─────────────────────────────────────────────────────────────

  @Get("projects")
  findProjects(@Query() query: GetBankProjectsDto) {
    return this.service.findProjects(query);
  }

  @Get("projects/:id")
  findProject(@Param("id", UUID_PIPE) id: string) {
    return this.service.findProject(id);
  }

  @Get("topics")
  findTopics() {
    return this.service.findPublishedTopics();
  }

  // ─── Темы (статические маршруты выше параметрических) ──────────────────────

  @Get("topics/my")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  findMyTopics(@CurrentUser("id") userId: string) {
    return this.service.findMyTopics(userId);
  }

  @Get("topics/admin/all")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  findAllTopics(@Query() query: GetBankTopicsDto) {
    return this.service.findAllTopics(query.status);
  }

  @Post("topics")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER, Role.ADMIN, Role.MODERATOR)
  createTopic(@CurrentUser() user: User, @Body() dto: CreateTopicDto) {
    return this.service.createTopic(user, dto);
  }

  @Patch("topics/:id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  updateTopicStatus(
    @Param("id", UUID_PIPE) id: string,
    @Body() dto: UpdateTopicStatusDto,
  ) {
    return this.service.updateTopicStatus(id, dto);
  }

  @Patch("topics/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  updateTopic(@Param("id", UUID_PIPE) id: string, @Body() dto: UpdateTopicDto) {
    return this.service.updateTopic(id, dto);
  }

  @Delete("topics/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  removeTopic(@Param("id", UUID_PIPE) id: string) {
    return this.service.removeTopic(id);
  }

  // ─── Предложения ───────────────────────────────────────────────────────────

  @Post("projects/:id/offers")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  createOffer(
    @Param("id", UUID_PIPE) id: string,
    @CurrentUser() user: User,
    @Body() dto: CreateOfferDto,
  ) {
    return this.service.createOffer(user, id, dto);
  }

  @Get("projects/:id/offers")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PARTICIPANT)
  findProjectOffers(
    @Param("id", UUID_PIPE) id: string,
    @CurrentUser() user: User,
  ) {
    return this.service.findProjectOffers(user, id);
  }

  // ─── Комментарии ───────────────────────────────────────────────────────────

  @Get("projects/:id/comments")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER, Role.PARTICIPANT, Role.ADMIN, Role.MODERATOR)
  findComments(@Param("id", UUID_PIPE) id: string, @CurrentUser() user: User) {
    return this.service.findComments(user, id);
  }

  @Post("projects/:id/comments")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER, Role.PARTICIPANT, Role.ADMIN, Role.MODERATOR)
  createComment(
    @Param("id", UUID_PIPE) id: string,
    @CurrentUser() user: User,
    @Body() dto: CreateCommentDto,
  ) {
    return this.service.createComment(user, id, dto);
  }

  @Delete("comments/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  removeComment(@Param("id", UUID_PIPE) id: string) {
    return this.service.removeComment(id);
  }
  
  @Get("offers/my")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  findMyOffers(@CurrentUser("id") userId: string) {
    return this.service.findMyOffers(userId);
  }

  @Get("offers/for-me")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PARTICIPANT)
  findOffersForMe(@CurrentUser("id") userId: string) {
    return this.service.findOffersForMe(userId);
  }

  @Get("offers")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  findOffers(@Query() query: GetBankOffersDto) {
    return this.service.findOffers(query.status);
  }

  @Patch("offers/:id/status")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR, Role.PARTICIPANT)
  updateOfferStatus(
    @Param("id", UUID_PIPE) id: string,
    @CurrentUser() user: User,
    @Body() dto: UpdateOfferStatusDto,
  ) {
    return this.service.updateOfferStatus(user, id, dto);
  }
}
