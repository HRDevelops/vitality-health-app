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

export function useToggleReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { data } = await apiClient.put(`/user/reminders/${id}`, { enabled });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'reminders'] });
    },
  });
}
