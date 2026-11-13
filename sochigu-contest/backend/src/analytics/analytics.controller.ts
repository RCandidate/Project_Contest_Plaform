import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MODERATOR, Role.EXPERT)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  private cid(contestId?: string): string | undefined {
    return contestId && UUID_RE.test(contestId) ? contestId : undefined;
  }

  @Get('summary')
  getSummary(@Query('contestId') contestId?: string) {
    return this.analyticsService.getSummary(this.cid(contestId));
  }

  @Get('by-nomination')
  getByNomination(@Query('contestId') contestId?: string) {
    return this.analyticsService.getByNomination(this.cid(contestId));
  }

  @Get('timeline')
  getTimeline(@Query('contestId') contestId?: string) {
    return this.analyticsService.getTimeline(this.cid(contestId));
  }

  @Get('geography')
  getGeography(@Query('contestId') contestId?: string) {
    return this.analyticsService.getGeography(this.cid(contestId));
  }

  @Get('keywords')
  getKeywords(@Query('contestId') contestId?: string) {
    return this.analyticsService.getKeywords(this.cid(contestId));
  }

  @Get('by-status')
  getByStatus(@Query('contestId') contestId?: string) {
    return this.analyticsService.getByStatus(this.cid(contestId));
  }

  @Get('activity')
  getActivity(@Query('contestId') contestId?: string) {
    return this.analyticsService.getActivity(this.cid(contestId));
  }
}
