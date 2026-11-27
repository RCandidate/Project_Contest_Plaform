import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  UseGuards,
} from "@nestjs/common";
import { FinalScoresService } from "./final-scores.service";
import {
  AdminUpsertFinalScoreDto,
  UpsertFinalScoreDto,
} from "./dto/upsert-final-score.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Role } from "../common/enums/role.enum";

@Controller("scores/final")
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinalScoresController {
  constructor(private service: FinalScoresService) {}

  @Get("application/:applicationId")
  @Roles(Role.EXPERT)
  getMine(
    @CurrentUser("id") expertId: string,
    @Param("applicationId", new ParseUUIDPipe()) applicationId: string,
  ) {
    return this.service.getFormData(applicationId, expertId);
  }

  @Get("application/:applicationId/expert/:expertId")
  @Roles(Role.ADMIN)
  getForExpert(
    @Param("applicationId", new ParseUUIDPipe()) applicationId: string,
    @Param("expertId", new ParseUUIDPipe()) expertId: string,
  ) {
    return this.service.getFormData(applicationId, expertId);
  }

  @Put()
  @Roles(Role.EXPERT)
  saveMine(
    @CurrentUser("id") expertId: string,
    @Body() dto: UpsertFinalScoreDto,
  ) {
    return this.service.saveMine(expertId, dto.applicationId, dto.items);
  }

  @Put("admin")
  @Roles(Role.ADMIN)
  saveByAdmin(
    @CurrentUser("id") adminId: string,
    @Body() dto: AdminUpsertFinalScoreDto,
  ) {
    return this.service.saveByAdmin(
      adminId,
      dto.expertId,
      dto.applicationId,
      dto.items,
    );
  }
}
