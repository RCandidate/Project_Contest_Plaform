import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { Transform } from "class-transformer";
import { trim } from "../../bank/dto/transforms";

export const MESSAGE_MAX_LENGTH = 2000;

export class CreateMessageDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: "Напишите сообщение" })
  @MaxLength(MESSAGE_MAX_LENGTH, {
    message: `Сообщение не длиннее ${MESSAGE_MAX_LENGTH} символов`,
  })
  text: string;

  // Внутренняя заметка (видна только персоналу). Участнику запрещена — проверяется в сервисе.
  @IsOptional()
  @IsBoolean()
  isInternal?: boolean;
}
