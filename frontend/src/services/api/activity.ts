import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { ActivityDaily, ActivityTrends, WaterTrend } from '../../types/domain';
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

export function useActivityTrends(range: 'daily' | 'week' | 'month') {
  return useQuery({
    queryKey: ['activity', 'trends', range],
    queryFn: async () => {
      const { data } = await apiClient.get<ActivityTrends>('/activity/trends', { params: { range } });
      return data;
    },
  });
}

export function useWaterTrend() {
  return useQuery({
    queryKey: ['activity', 'water-trend'],
    queryFn: async () => {
      const { data } = await apiClient.get<WaterTrend>('/activity/water-trend');
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
      const { data } = await apiClient.post<ActivityDaily>('/activity/log', payload);
      return data;
    },
    onSuccess: () => {
      invalidateAll(queryClient);
      triggerCelebration();
    },
  });
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (workoutId: string) => {
      const { data } = await apiClient.delete<ActivityDaily>(`/activity/workout/${workoutId}`);
      return data;
    },
    onSuccess: () => invalidateAll(queryClient),
  });
}
