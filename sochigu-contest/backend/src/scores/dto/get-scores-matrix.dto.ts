import { IsIn, IsOptional, IsUUID } from "class-validator";

export class GetScoresMatrixDto {
  @IsOptional()
  @IsUUID("all", { message: "Некорректный идентификатор конкурса" })
  contestId?: string;

  // 1 — заочный этап (по умолчанию), 2 — очный
  @IsOptional()
  @IsIn(["1", "2"], { message: "Этап должен быть 1 или 2" })
  stage?: "1" | "2";
}
