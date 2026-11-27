import { IsInt, Max, Min, ValidateIf } from 'class-validator';

export class UpdatePlaceDto {
  // 1, 2, 3 или null (снять место)
  @ValidateIf((o) => o.place !== null)
  @IsInt({ message: 'Место должно быть целым числом' })
  @Min(1, { message: 'Место — от 1 до 3' })
  @Max(3, { message: 'Место — от 1 до 3' })
  place: number | null;
}
