import { IsOptional, IsEnum } from "class-validator";
import { BankTopicStatus } from "../../common/enums/bank.enum";

export class GetBankTopicsDto {
  @IsOptional()
  @IsEnum(BankTopicStatus)
  status?: BankTopicStatus;
}
