import { apiClient } from './client';
import { News } from '@/types';

export const newsApi = {
  getPublished: (page = 1, limit = 10) =>
    apiClient.get<[News[], number]>('/news', { params: { page, limit } }).then(r => r.data),
  getBySlug: (slug: string) => apiClient.get<News>(`/news/${slug}`).then(r => r.data),
  getPinned: (): Promise<News | null> =>
    apiClient.get('/news/pinned').then((r) => r.data), // тут апи добавил
  getAll: () => apiClient.get<News[]>('/news/admin/all').then(r => r.data),
  create: (data: Partial<News>) => apiClient.post('/news', data).then(r => r.data),
  update: (id: string, data: Partial<News>) => apiClient.patch(`/news/${id}`, data).then(r => r.data),
  remove: (id: string) => apiClient.delete(`/news/${id}`).then(r => r.data),
  uploadPhoto: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return apiClient.post<{ url: string }>('/news/upload-photo', fd, { headers: { 'Content-Type': undefined } }).then(r => r.data.url);
  },
};
