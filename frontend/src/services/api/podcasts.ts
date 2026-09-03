import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { Podcast } from '../../types/domain';
import { triggerCelebration } from '../../lib/celebration';

export function usePodcasts() {
  return useQuery({
    queryKey: ['podcasts'],
    queryFn: async () => {
      const { data } = await apiClient.get<Podcast[]>('/podcasts');
      return data;
    },
  });
}

export function useLogPodcastListen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (podcastId: string) => {
      const { data } = await apiClient.post<{ podcastSessionsCompleted: number }>(`/podcasts/${podcastId}/listen`);
      return data;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      if (result.podcastSessionsCompleted === 3) {
        triggerCelebration();
      }
    },
  });
}
