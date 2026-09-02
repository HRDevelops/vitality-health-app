import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import { Podcast } from '../../types/domain';

export function usePodcasts() {
  return useQuery({
    queryKey: ['podcasts'],
    queryFn: async () => {
      const { data } = await apiClient.get<Podcast[]>('/podcasts');
      return data;
    },
  });
}
