import { apiClient } from './client';
import { Contest } from '@/types';

export const contestsApi = {
  getAll: () => apiClient.get<Contest[]>('/contests').then(r => r.data),
  getActive: () => apiClient.get<Contest | null>('/contests/active').then(r => r.data),
  create: (data: Partial<Contest>) => apiClient.post<Contest>('/contests', data).then(r => r.data),
  update: (id: string, data: Partial<Contest>) => apiClient.patch<Contest>(`/contests/${id}`, data).then(r => r.data),
  activate: (id: string) => apiClient.patch<Contest>(`/contests/${id}/activate`).then(r => r.data),
  remove: (id: string) => apiClient.delete(`/contests/${id}`).then(r => r.data),
};
