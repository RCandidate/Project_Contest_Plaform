import { apiClient } from "./client";
import { Score, ScoreMatrix, ScoreQuality } from "@/types";

export interface UpsertScoreDto {
  applicationId: string;
  points: number;
  qualities?: string[];
  specialOpinion?: string;
}

export const scoresApi = {
  // только admin
  getMatrix: (contestId?: string, stage: 1 | 2 = 1) =>
    apiClient
      .get<ScoreMatrix>("/scores/matrix", {
        params: { ...(contestId ? { contestId } : {}), stage },
      })
      .then((r) => r.data),
  // только admin: скачать сводную таблицу в Excel
  exportExcel: (contestId?: string, stage: 1 | 2 = 1) =>
    apiClient
      .get("/scores/matrix/export", {
        params: { ...(contestId ? { contestId } : {}), stage },
        responseType: "blob",
      })
      .then((r) => {
        const url = URL.createObjectURL(r.data);
        const a = document.createElement("a");
        a.href = url;
        a.download = `scores-stage${stage}-${Date.now()}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
      }),
  // эксперт: создать или обновить свою оценку заявки
  upsert: (dto: UpsertScoreDto) =>
    apiClient.put<Score>("/scores", dto).then((r) => r.data),
  getMy: () => apiClient.get<Score[]>("/scores/my").then((r) => r.data),
  getQualities: () =>
    apiClient.get<ScoreQuality[]>("/scores/qualities").then((r) => r.data),
};
