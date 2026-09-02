import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import { DashboardMetrics } from '../../types/domain';

export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardMetrics>('/dashboard/metrics');
      return data;
    },
  });
}
