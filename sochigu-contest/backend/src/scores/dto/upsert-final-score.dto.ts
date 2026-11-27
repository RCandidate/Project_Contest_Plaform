import { IsObject, IsUUID } from "class-validator";

// Оценка очного этапа. items — набор критериев ЦЕЛИКОМ: { код критерия: баллы }.
// Критерий, которого нет в наборе или у которого null, считается не оценённым;
// пустой набор удаляет оценку. Целость баллов и максимумы проверяет сервис,
// потому что они зависят от номинации заявки.
export class UpsertFinalScoreDto {
  @IsUUID("all", { message: "Некорректный идентификатор заявки" })
  applicationId: string;

  @IsObject({ message: "Баллы должны быть объектом вида { код критерия: баллы }" })
  items: Record<string, number | null>;
}

// Правка админа от имени эксперта
export class AdminUpsertFinalScoreDto extends UpsertFinalScoreDto {
  @IsUUID("all", { message: "Некорректный идентификатор эксперта" })
  expertId: string;
}
