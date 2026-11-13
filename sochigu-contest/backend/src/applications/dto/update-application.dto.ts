import { IsString, IsUUID, IsArray, IsOptional, IsObject } from 'class-validator';

export class UpdateApplicationDto {
  @IsOptional()
  @IsUUID()
  nominationId?: string;

  @IsOptional()
  @IsString()
  projectTitle?: string;

  @IsOptional()
  @IsString()
  projectDescription?: string;

  @IsOptional()
  @IsArray()
  keywords?: string[];

  @IsOptional()
  @IsArray()
  teamMembers?: { name: string; role: string; email?: string }[];

  @IsOptional()
  @IsObject()
  supervisor?: { name: string; title: string; email?: string };
}
