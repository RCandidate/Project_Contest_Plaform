import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApplicationStatus } from '../../common/enums/application-status.enum';

export class UpdateStatusDto {
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @IsOptional()
  @IsString()
  comment?: string;
}
