import { IsOptional, IsEnum } from "class-validator";
import { OfferStatus } from "../../common/enums/bank.enum";

export class GetBankOffersDto {
  @IsOptional()
  @IsEnum(OfferStatus)
  status?: OfferStatus;
}
