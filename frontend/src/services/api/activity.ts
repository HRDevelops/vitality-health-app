import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { ActivityDaily, ActivityTrends } from '../../types/domain';
import { triggerCelebration } from '../../lib/celebration';

const SYNC_KEYS = ['dashboard', 'activity', 'nutrition', 'user'];

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  SYNC_KEYS.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
}

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
      const { data } = await apiClient.post<ActivityDaily>('/activity/water', { amountMl });
      return { log: data, amountMl };
    },
    onSuccess: ({ log, amountMl }) => {
      invalidateAll(queryClient);
      const before = log.waterMl - amountMl;
      if (before < log.waterGoalMl && log.waterMl >= log.waterGoalMl) {
        triggerCelebration();
      }
    },
  });
}

export function useLogWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { title?: string; steps?: number; caloriesBurned?: number; distanceKm?: number; activeMinutes?: number }) => {
      const { data } = await apiClient.post('/activity/log', payload);
      return data;
    },
    onSuccess: () => {
      invalidateAll(queryClient);
      triggerCelebration();
    },
  });
}
