import { apiClient } from './client';
import { useAuthStore } from '@/store/auth.store';

export const authApi = {
  register: async (data: any) => {
    const res = await apiClient.post('/auth/register', data);
    return res.data; // { message: '...' }
  },
  verifyEmail: async (token: string) => {
    const res = await apiClient.get(`/auth/verify-email?token=${token}`);
    return res.data;
  },
  login: async (data: { email: string; password: string }) => {
    const res = await apiClient.post('/auth/login', data);
    useAuthStore.getState().setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
    return res.data;
  },
  logout: async () => {
    await apiClient.post('/auth/logout').catch(() => {});
    useAuthStore.getState().logout();
  },
};
