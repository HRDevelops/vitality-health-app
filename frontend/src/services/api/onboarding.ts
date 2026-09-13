import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { OnboardingData, UserProfile } from '../../types/domain';

export function useSubmitQuestionnaire() {
  const queryClient = useQueryClient();
  return useMutation<UserProfile, Error, OnboardingData>({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post<UserProfile>('/onboarding/questionnaire', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useClaimGuestAccount() {
  const queryClient = useQueryClient();
  return useMutation<
    { user: UserProfile; token: string },
    Error,
    { name: string; email: string; password: string }
  >({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post<{ user: UserProfile; token: string }>(
        '/onboarding/claim-guest',
        payload
      );
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem('vitality_auth', JSON.stringify({ user: data.user }));
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useSetDemoMode() {
  const queryClient = useQueryClient();
  return useMutation<UserProfile, Error, boolean>({
    mutationFn: async (enableDemo) => {
      const { data } = await apiClient.post<UserProfile>('/user/demo-mode', { enableDemo });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useSubmitRating() {
  const queryClient = useQueryClient();
  return useMutation<
    { success: boolean; hasRatedApp: boolean },
    Error,
    { rating: number; feedback?: string }
  >({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post<{ success: boolean; hasRatedApp: boolean }>(
        '/user/rate',
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });
}
