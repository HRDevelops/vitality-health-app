import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { UserProfile } from '../../types/domain';

const SYNC_KEYS = ['dashboard', 'activity', 'nutrition', 'user'];

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  SYNC_KEYS.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }));
}

export function useUserProfile() {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const { data } = await apiClient.get<UserProfile>('/user/profile');
      return data;
    },
  });
}

export function useUpdateWeight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (weightKg: number) => {
      const { data } = await apiClient.put('/user/weight', { weightKg });
      return data;
    },
    onSuccess: () => invalidateAll(queryClient),
  });
}

export interface UpdateProfilePayload {
  name?: string;
  heightCm?: number;
  targetWeightKg?: number;
  avatarUrl?: string;
  stepGoal?: number;
  waterGoal?: number;
  calorieGoal?: number;
  macros?: { protein?: number; carbs?: number; fat?: number };
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const { data } = await apiClient.put('/user/profile', payload);
      return data;
    },
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useUpdateStreakFreeze() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (equipped: boolean) => {
      const { data } = await apiClient.put('/user/streak-freeze', { equipped });
      return data;
    },
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      const { data } = await apiClient.put<{ message: string }>('/user/password', { currentPassword, newPassword });
      return data;
    },
  });
}
