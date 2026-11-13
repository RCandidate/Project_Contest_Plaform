import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { Transform } from "class-transformer";
import { BankTopicStatus } from "../../common/enums/bank.enum";
import { trimOrUndefined } from "./transforms";

export class UpdateTopicStatusDto {
  @IsEnum(BankTopicStatus)
  status: BankTopicStatus;

  @Transform(trimOrUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: "Комментарий не длиннее 1000 символов" })
  moderationComment?: string;
}
