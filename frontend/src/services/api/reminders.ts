import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { Reminder } from '../../types/domain';

export function useReminders() {
  return useQuery({
    queryKey: ['user', 'reminders'],
    queryFn: async () => {
      const { data } = await apiClient.get<Reminder[]>('/user/reminders');
      return data;
    },
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, enabled, time }: { id: string; enabled?: boolean; time?: string }) => {
      const { data } = await apiClient.put(`/user/reminders/${id}`, { enabled, time });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'reminders'] });
    },
  });
}
