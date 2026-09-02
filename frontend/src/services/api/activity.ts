import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { ActivityDaily, ActivityTrends } from '../../types/domain';

export function useActivityDaily(date?: string) {
  return useQuery({
    queryKey: ['activity', 'daily', date ?? 'today'],
    queryFn: async () => {
      const { data } = await apiClient.get<ActivityDaily>('/activity/daily', { params: { date } });
      return data;
    },
  });
}

export function useActivityTrends(range: 'week' | 'month') {
  return useQuery({
    queryKey: ['activity', 'trends', range],
    queryFn: async () => {
      const { data } = await apiClient.get<ActivityTrends>('/activity/trends', { params: { range } });
      return data;
    },
  });
}

export function useLogWater() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (amountMl: number) => {
      const { data } = await apiClient.post('/activity/water', { amountMl });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useLogWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { steps?: number; caloriesBurned?: number; distanceKm?: number; activeMinutes?: number }) => {
      const { data } = await apiClient.post('/activity/log', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
