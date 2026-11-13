import { apiClient } from "./client";
import {
  BankProject,
  BankTopic,
  BankTopicStatus,
  BankOffer,
  BankOfferStatus,
  BankComment,
} from "@/types";
export interface BankProjectsParams {
  search?: string;
  nominationId?: string;
  contestId?: string;
  page?: number;
  limit?: number;
}

export interface BankProjectsResponse {
  data: BankProject[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateTopicDto {
  title: string;
  description: string;
  organization: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface CreateOfferDto {
  message: string;
  contactEmail?: string;
  contactPhone?: string;
}

export const bankApi = {
  getProjects: (params?: BankProjectsParams) =>
    apiClient
      .get<BankProjectsResponse>("/bank/projects", { params })
      .then((r) => r.data),
  getProject: (id: string) =>
    apiClient.get<BankProject>(`/bank/projects/${id}`).then((r) => r.data),
  getTopics: () =>
    apiClient.get<BankTopic[]>("/bank/topics").then((r) => r.data),
  getMyTopics: () =>
    apiClient.get<BankTopic[]>("/bank/topics/my").then((r) => r.data),
  createTopic: (dto: CreateTopicDto) =>
    apiClient.post<BankTopic>("/bank/topics", dto).then((r) => r.data),
  createOffer: (applicationId: string, dto: CreateOfferDto) =>
    apiClient
      .post<BankOffer>(`/bank/projects/${applicationId}/offers`, dto)
      .then((r) => r.data),
  getMyOffers: () =>
    apiClient.get<BankOffer[]>("/bank/offers/my").then((r) => r.data),
  // участник: предложения к своим проектам (контакты — только после принятия)
  getOffersForMe: () =>
    apiClient.get<BankOffer[]>("/bank/offers/for-me").then((r) => r.data),
  // admin и moderator: все предложения проекта
  getProjectOffers: (applicationId: string) =>
    apiClient
      .get<BankOffer[]>(`/bank/projects/${applicationId}/offers`)
      .then((r) => r.data),
  updateOfferStatus: (id: string, status: BankOfferStatus) =>
    apiClient
      .patch<BankOffer>(`/bank/offers/${id}/status`, { status })
      .then((r) => r.data),
  getComments: (applicationId: string) =>
    apiClient
      .get<BankComment[]>(`/bank/projects/${applicationId}/comments`)
      .then((r) => r.data),
  createComment: (applicationId: string, text: string) =>
    apiClient
      .post<BankComment>(`/bank/projects/${applicationId}/comments`, { text })
      .then((r) => r.data),
  deleteComment: (id: string) =>
    apiClient.delete(`/bank/comments/${id}`).then((r) => r.data),
  // admin и moderator: все темы и модерация
  getAdminTopics: (status?: BankTopicStatus) =>
    apiClient
      .get<
        BankTopic[]
      >("/bank/topics/admin/all", { params: status ? { status } : undefined })
      .then((r) => r.data),
  updateTopicStatus: (
    id: string,
    dto: { status: BankTopicStatus; moderationComment?: string },
  ) =>
    apiClient
      .patch<BankTopic>(`/bank/topics/${id}/status`, dto)
      .then((r) => r.data),
};
