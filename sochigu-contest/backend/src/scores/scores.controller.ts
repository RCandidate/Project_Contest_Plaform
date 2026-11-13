import { Body, Controller, Get, Put, Query, UseGuards } from "@nestjs/common";
import { ScoresService } from "./scores.service";
import { UpsertScoreDto } from "./dto/upsert-score.dto";
import { GetScoresMatrixDto } from "./dto/get-scores-matrix.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Role } from "../common/enums/role.enum";

@Controller("scores")
export class ScoresController {
  constructor(private service: ScoresService) {}

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EXPERT)
  upsert(@CurrentUser("id") expertId: string, @Body() dto: UpsertScoreDto) {
    return this.service.upsertMine(expertId, dto);
  }

  @Get("my")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EXPERT)
  findMine(@CurrentUser("id") expertId: string) {
    return this.service.findMine(expertId);
  }

  @Get("qualities")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EXPERT, Role.ADMIN)
  getQualities() {
    return this.service.getQualities();
  }

  @Get("matrix")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getMatrix(@Query() query: GetScoresMatrixDto) {
    return this.service.getMatrix(query.contestId);
  }
}
