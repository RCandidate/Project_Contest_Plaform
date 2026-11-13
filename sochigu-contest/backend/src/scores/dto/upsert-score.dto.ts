import {
  ArrayUnique,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { Transform } from "class-transformer";
import { SCORE_QUALITY_CODES } from "../score-qualities";

export class UpsertScoreDto {
  @IsUUID("all", { message: "Некорректный идентификатор заявки" })
  applicationId: string;

  @IsInt({ message: "Баллы должны быть целым числом" })
  @Min(0, { message: "Баллы не меньше 0" })
  @Max(100, { message: "Баллы не больше 100" })
  points: number;

  @IsOptional()
  @IsArray({ message: "Качества должны быть списком" })
  @ArrayUnique({ message: "Качества не должны повторяться" })
  @IsIn(SCORE_QUALITY_CODES, { each: true, message: "Неизвестное качество" })
  qualities?: string[];

  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: "Особое мнение не длиннее 50 символов" })
  specialOpinion?: string;
}
