import { IsEnum } from "class-validator";
import { OfferStatus } from "../../common/enums/bank.enum";

export class UpdateOfferStatusDto {
  @IsEnum(OfferStatus)
  status: OfferStatus;
}
