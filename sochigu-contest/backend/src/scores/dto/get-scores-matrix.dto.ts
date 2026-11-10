import { IsOptional, IsUUID } from "class-validator";

export class GetScoresMatrixDto {
  @IsOptional()
  @IsUUID("all", { message: "Некорректный идентификатор конкурса" })
  contestId?: string;
}
