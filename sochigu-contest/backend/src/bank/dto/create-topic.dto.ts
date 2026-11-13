import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { Transform } from "class-transformer";
import { trim, trimOrUndefined } from "./transforms";

export class CreateTopicDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: "Укажите название темы" })
  @MaxLength(200, { message: "Название не длиннее 200 символов" })
  title: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: "Укажите описание темы" })
  @MaxLength(5000, { message: "Описание не длиннее 5000 символов" })
  description: string;

  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: "Укажите организацию" })
  @MaxLength(255, { message: "Название организации не длиннее 255 символов" })
  organization: string;

  @Transform(trimOrUndefined)
  @IsOptional()
  @IsEmail({}, { message: "Укажите корректный email" })
  @MaxLength(255)
  contactEmail?: string;

  @Transform(trimOrUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: "Телефон не длиннее 50 символов" })
  contactPhone?: string;
}
