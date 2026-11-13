import { apiClient } from './client';
import { Winner } from '@/types';

export const winnersApi = {
  getAll: (params?: { year?: number; nominationId?: string; contestId?: string }) =>
    apiClient.get<Winner[]>('/winners', { params }).then(r => r.data),
  getYears: () => apiClient.get<{ year: number }[]>('/winners/years').then(r => r.data),
  getContests: () => apiClient.get<{ id: string; name: string; startDate: string; endDate: string }[]>('/winners/contests').then(r => r.data),
  create: (data: Partial<Winner>) => apiClient.post('/winners', data).then(r => r.data),
  update: (id: string, data: Partial<Winner>) => apiClient.patch(`/winners/${id}`, data).then(r => r.data),
  remove: (id: string) => apiClient.delete(`/winners/${id}`).then(r => r.data),
  uploadPhoto: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return apiClient.post<{ url: string }>('/winners/upload-photo', fd, { headers: { 'Content-Type': undefined } }).then(r => r.data.url);
  },
};
