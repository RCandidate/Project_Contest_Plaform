import { apiClient } from './client';
import { Document } from '@/types';

export const documentsApi = {
  getAll: () => apiClient.get<Document[]>('/documents').then(r => r.data.map(d => ({ ...d, size: Number(d.size) }))),
  getAllAdmin: () => apiClient.get<Document[]>('/documents/admin/all').then(r => r.data.map(d => ({ ...d, size: Number(d.size) }))),
  create: (data: FormData) => apiClient.post('/documents/upload', data, { headers: { 'Content-Type': undefined } }).then(r => r.data),
  update: (id: string, data: { title?: string; category?: string; isPublished?: boolean; contestId?: string }) => apiClient.patch(`/documents/${id}`, data).then(r => r.data),
  remove: (id: string) => apiClient.delete(`/documents/${id}`).then(r => r.data),
  downloadUrl: (id: string) => `/api/documents/${id}/download`,
};
