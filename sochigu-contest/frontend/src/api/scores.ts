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
  getMatrix: (contestId?: string) =>
    apiClient
      .get<ScoreMatrix>(
        "/scores/matrix",
        contestId ? { params: { contestId } } : {},
      )
      .then((r) => r.data),
  // эксперт: создать или обновить свою оценку заявки
  upsert: (dto: UpsertScoreDto) =>
    apiClient.put<Score>("/scores", dto).then((r) => r.data),
  getMy: () => apiClient.get<Score[]>("/scores/my").then((r) => r.data),
  getQualities: () =>
    apiClient.get<ScoreQuality[]>("/scores/qualities").then((r) => r.data),
};
