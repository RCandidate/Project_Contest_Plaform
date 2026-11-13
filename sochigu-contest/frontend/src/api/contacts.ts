import { apiClient } from './client';
import { ContactMessage } from '@/types';

export const contactsApi = {
  submit: (data: { name: string; email?: string; phone?: string; message: string }) =>
    apiClient.post<ContactMessage>('/contact-messages', data).then(r => r.data),

  getAll: (status?: string) =>
    apiClient.get<ContactMessage[]>('/contact-messages', { params: status ? { status } : {} }).then(r => r.data),

  getById: (id: string) =>
    apiClient.get<ContactMessage>(`/contact-messages/${id}`).then(r => r.data),

  updateStatus: (id: string, status: 'pending' | 'done') =>
    apiClient.patch<ContactMessage>(`/contact-messages/${id}/status`, { status }).then(r => r.data),
};
