import { apiClient } from './client';
import {
  AnalyticsSummary, AnalyticsByNomination, AnalyticsTimeline,
  AnalyticsGeography, AnalyticsByStatus, AnalyticsActivityItem,
} from '@/types';

const params = (contestId?: string) => contestId ? { params: { contestId } } : {};

export const analyticsApi = {
  getSummary: (contestId?: string) => apiClient.get<AnalyticsSummary>('/analytics/summary', params(contestId)).then(r => r.data),
  getByNomination: (contestId?: string) => apiClient.get<AnalyticsByNomination[]>('/analytics/by-nomination', params(contestId)).then(r => r.data),
  getTimeline: (contestId?: string) => apiClient.get<AnalyticsTimeline[]>('/analytics/timeline', params(contestId)).then(r => r.data),
  getGeography: (contestId?: string) => apiClient.get<AnalyticsGeography[]>('/analytics/geography', params(contestId)).then(r => r.data),
  getByStatus: (contestId?: string) => apiClient.get<AnalyticsByStatus[]>('/analytics/by-status', params(contestId)).then(r => r.data),
  getActivity: (contestId?: string) => apiClient.get<AnalyticsActivityItem[]>('/analytics/activity', params(contestId)).then(r => r.data),
};
