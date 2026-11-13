import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { Transform } from "class-transformer";
import { trim, trimOrUndefined } from "./transforms";

export class CreateOfferDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: "Напишите текст предложения" })
  @MaxLength(3000, { message: "Предложение не длиннее 3000 символов" })
  message: string;

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
