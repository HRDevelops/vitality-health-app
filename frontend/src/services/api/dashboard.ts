import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import { DashboardMetrics, WeeklyDigest, HealthScoreHistory } from '../../types/domain';

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardMetrics>('/dashboard/metrics');
      return data;
    },
  });
}

export function useWeeklyDigest() {
  return useQuery({
    queryKey: ['dashboard', 'weekly-digest'],
    queryFn: async () => {
      const { data } = await apiClient.get<WeeklyDigest>('/dashboard/weekly-digest');
      return data;
    },
  });
}

export function useHealthScoreHistory(range: 'week' | 'month') {
  return useQuery({
    queryKey: ['dashboard', 'health-score-history', range],
    queryFn: async () => {
      const { data } = await apiClient.get<HealthScoreHistory>('/dashboard/health-score-history', { params: { range } });
      return data;
    },
  });
}
