import { apiClient } from './client';
import { Application, ApplicationStatus, CreateApplicationDto, PaginatedResponse } from '@/types';

export const applicationsApi = {
  create: (data: CreateApplicationDto) => apiClient.post<Application>('/applications', data).then(r => r.data),
  getMy: () => apiClient.get<Application[]>('/applications/my').then(r => r.data),
  getAll: (params?: Record<string, string | number | undefined>) =>
    apiClient.get<PaginatedResponse<Application>>('/applications', { params }).then(r => r.data),
  getById: (id: string) => apiClient.get<Application>(`/applications/${id}`).then(r => r.data),
  update: (id: string, data: Partial<CreateApplicationDto>) => apiClient.patch<Application>(`/applications/${id}`, data).then(r => r.data),
  submit: (id: string) => apiClient.post<Application>(`/applications/${id}/submit`).then(r => r.data),
  updateStatus: (id: string, data: { status: ApplicationStatus; comment?: string }) =>
    apiClient.patch<Application>(`/applications/${id}/status`, data).then(r => r.data),
  deleteApp: (id: string) => apiClient.delete(`/applications/${id}`).then(r => r.data),
  withdraw: (id: string) => apiClient.post(`/applications/${id}/withdraw`).then(r => r.data),
  uploadFile: (applicationId: string, file: File, category: string) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('category', category);
    return apiClient.post(`/files/upload/${applicationId}`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data);
  },
  deleteFile: (fileId: string) => apiClient.delete(`/files/${fileId}`).then(r => r.data),
  downloadFile: (fileId: string) =>
    apiClient.get(`/files/${fileId}/download`, { responseType: 'blob' }).then(r => r.data),
  downloadFileUrl: (fileId: string) => `/api/files/${fileId}/download`,
  exportExcel: (params?: Record<string, string | undefined>) =>
    apiClient.get('/applications/export/excel', { params, responseType: 'blob' }).then(r => {
      const url = URL.createObjectURL(r.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `applications-${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    }),
};
