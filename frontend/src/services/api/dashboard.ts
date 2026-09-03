import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import { DashboardMetrics, WeeklyDigest } from '../../types/domain';

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
