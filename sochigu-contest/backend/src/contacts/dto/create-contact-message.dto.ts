import { IsString, IsEmail, MinLength, ValidateIf, IsNotEmpty } from 'class-validator';

export class CreateContactMessageDto {
  @IsString()
  name: string;

  @ValidateIf((o) => !o.phone)
  @IsEmail({}, { message: 'Укажите корректный email или номер телефона' })
  @IsNotEmpty({ message: 'Укажите email или телефон' })
  email?: string;

  @ValidateIf((o) => !o.email)
  @IsString()
  @IsNotEmpty({ message: 'Укажите телефон или email' })
  phone?: string;

  @IsString()
  @MinLength(1)
  message: string;
}
