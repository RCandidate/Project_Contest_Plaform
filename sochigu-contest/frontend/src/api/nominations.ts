import { apiClient } from './client';
import { Nomination } from '@/types';

export const nominationsApi = {
  getAll: () => apiClient.get<Nomination[]>('/nominations').then(r => r.data),
  getAllAdmin: () => apiClient.get<Nomination[]>('/nominations/admin').then(r => r.data),
  create: (data: Partial<Nomination>) => apiClient.post('/nominations', data).then(r => r.data),
  update: (id: string, data: Partial<Nomination>) => apiClient.patch(`/nominations/${id}`, data).then(r => r.data),
  remove: (id: string) => apiClient.delete(`/nominations/${id}`).then(r => r.data),
};
