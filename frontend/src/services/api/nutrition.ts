import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { MealType, NutritionLogsResponse } from '../../types/domain';

const SYNC_KEYS = ['dashboard', 'activity', 'nutrition', 'user'];

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  SYNC_KEYS.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
}

export function useNutritionLogs(date?: string) {
  return useQuery({
    queryKey: ['nutrition', 'logs', date ?? 'today'],
    queryFn: async () => {
      const { data } = await apiClient.get<NutritionLogsResponse>('/nutrition/logs', { params: { date } });
      return data;
    },
  });
}

export interface CreateNutritionLogPayload {
  mealType: MealType;
  foodName: string;
  calories: number;
  carbsGrams?: number;
  proteinGrams?: number;
  fatGrams?: number;
  logDate?: string;
}

export function useCreateNutritionLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateNutritionLogPayload) => {
      const { data } = await apiClient.post('/nutrition/logs', payload);
      return data;
    },
    onSuccess: () => invalidateAll(queryClient),
  });
}
