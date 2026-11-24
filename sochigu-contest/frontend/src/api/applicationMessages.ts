import { apiClient } from "./client";
import { ApplicationMessage, UnreadMap } from "@/types";

export const applicationMessagesApi = {
  list: (applicationId: string) =>
    apiClient
      .get<
        ApplicationMessage[]
      >(`/application-messages/application/${applicationId}`)
      .then((r) => r.data),

  send: (applicationId: string, text: string, isInternal?: boolean) =>
    apiClient
      .post<ApplicationMessage>(
        `/application-messages/application/${applicationId}`,
        {
          text,
          ...(isInternal ? { isInternal: true } : {}),
        },
      )
      .then((r) => r.data),

  markRead: (applicationId: string) =>
    apiClient
      .post(`/application-messages/application/${applicationId}/read`)
      .then((r) => r.data),

  unread: () =>
    apiClient
      .get<UnreadMap>("/application-messages/unread")
      .then((r) => r.data),

  // admin и moderator
  remove: (id: string) =>
    apiClient.delete(`/application-messages/${id}`).then((r) => r.data),
};
