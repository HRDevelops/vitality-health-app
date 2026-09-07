import { useMutation } from '@tanstack/react-query';
import { apiClient } from './client';

interface ForgotPasswordResponse {
  message: string;
  resetToken?: string;
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', { email });
      return data;
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ token, newPassword }: { token: string; newPassword: string }) => {
      const { data } = await apiClient.post<{ message: string }>('/auth/reset-password', { token, newPassword });
      return data;
    },
  });
}
