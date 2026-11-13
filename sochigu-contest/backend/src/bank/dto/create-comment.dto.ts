import { IsNotEmpty, IsString, MaxLength } from "class-validator";
import { Transform } from "class-transformer";
import { trim } from "./transforms";

export class CreateCommentDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: "Напишите комментарий" })
  @MaxLength(1000, { message: "Комментарий не длиннее 1000 символов" })
  text: string;
}
