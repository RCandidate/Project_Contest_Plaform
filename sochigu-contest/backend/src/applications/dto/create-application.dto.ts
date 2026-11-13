import { IsString, IsUUID, IsArray, IsOptional, IsObject, MaxLength } from 'class-validator';

export class CreateApplicationDto {
  @IsUUID()
  nominationId: string;

  @IsString()
  @MaxLength(200)
  projectTitle: string;

  @IsString()
  @MaxLength(5000)
  projectDescription: string;

  @IsOptional()
  @IsArray()
  keywords?: string[];

  @IsOptional()
  @IsArray()
  teamMembers?: {
    name: string;
    role: string;
    email?: string;
  }[];

  @IsOptional()
  @IsObject()
  supervisor?: {
    name: string;
    title: string;
    email?: string;
  };
}
