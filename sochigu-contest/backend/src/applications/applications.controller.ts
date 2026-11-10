import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { GetApplicationsDto } from './dto/get-applications.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@Controller("applications")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PARTICIPANT, Role.EXPERT, Role.MODERATOR, Role.ADMIN)
export class ApplicationsController {
  constructor(private service: ApplicationsService) {}

  @Post()
  create(@CurrentUser("id") userId: string, @Body() dto: CreateApplicationDto) {
    return this.service.create(userId, dto);
  }

  @Get("my")
  findMy(@CurrentUser("id") userId: string) {
    return this.service.findByUser(userId);
  }

  @Get("export/excel")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR)
  async exportExcel(
    @Query() query: GetApplicationsDto,
    @Res() res: Response,
  ): Promise<void> {
    const buffer = await this.service.exportToExcel(query);
    res.set({
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="applications-${Date.now()}.xlsx"`,
    });
    res.send(buffer);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR, Role.EXPERT)
  findAll(@Query() query: GetApplicationsDto) {
    return this.service.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: any) {
    const userId = user.role === Role.PARTICIPANT ? user.id : undefined;
    return this.service.findById(id, userId);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
    @Body() dto: UpdateApplicationDto,
  ) {
    return this.service.update(id, userId, dto);
  }

  @Post(":id/submit")
  submit(@Param("id") id: string, @CurrentUser("id") userId: string) {
    return this.service.submit(id, userId);
  }

  @Patch(":id/status")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.MODERATOR, Role.EXPERT)
  updateStatus(
    @Param("id") id: string,
    @CurrentUser("id") adminId: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.service.updateStatus(id, adminId, dto);
  }

  @Delete(":id")
  delete(@Param("id") id: string, @CurrentUser("id") userId: string) {
    return this.service.delete(id, userId);
  }

  @Post(":id/withdraw")
  withdraw(@Param("id") id: string, @CurrentUser("id") userId: string) {
    return this.service.withdraw(id, userId);
  }
}
