import {
  Controller, Post, Delete, Get, Param, Body, UploadedFile,
  UseGuards, UseInterceptors, Res, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { resolve, sep } from 'path';
import { Response } from 'express';

const FILES_DIR = resolve(__dirname, '../../uploads');
import { FilesService } from './files.service';
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { Role } from "../common/enums/role.enum";
import { FileCategory } from "../common/enums/file-type.enum";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { ApplicationStatus } from "../common/enums/application-status.enum";

@Controller("files")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PARTICIPANT, Role.EXPERT, Role.MODERATOR, Role.ADMIN)
export class FilesController {
  constructor(private filesService: FilesService) {}

  @Post("upload/:applicationId")
  @UseInterceptors(FileInterceptor("file"))
  async upload(
    @Param("applicationId") applicationId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body("category") category: FileCategory,
    @CurrentUser() user: any,
  ) {
    if (user.role === "participant") {
      const app = await this.filesService.findApplicationById(applicationId);
      if (!app || app.userId !== user.id) throw new ForbiddenException();
    }
    return this.filesService.saveFile(applicationId, file, category);
  }

  @Get(":id/download")
  async download(
    @Param("id") id: string,
    @Res() res: Response,
    @CurrentUser() user: any,
  ) {
    const file = await this.filesService.findById(id);
    if (user.role === "participant" && file.application?.userId !== user.id) {
      throw new ForbiddenException();
    }
    const safePath = resolve(file.path);
    if (!safePath.startsWith(FILES_DIR + sep)) {
      throw new BadRequestException("Invalid file path");
    }
    res.download(safePath, file.originalName);
  }

  @Delete(":id")
  @Roles(Role.PARTICIPANT, Role.MODERATOR, Role.ADMIN)
  async remove(@Param("id") id: string, @CurrentUser() user: any) {
    const file = await this.filesService.findById(id);
    if (user.role === "participant") {
      if (file.application?.userId !== user.id) throw new ForbiddenException();
      if (file.application.status !== ApplicationStatus.DRAFT) {
        throw new ForbiddenException("Файлы можно удалять только из черновика заявки");
      }
    }
    return this.filesService.remove(id);
  }
}
