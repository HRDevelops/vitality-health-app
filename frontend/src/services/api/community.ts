import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import { LeaderboardEntry } from '../../types/domain';

export function useLeaderboard() {
  return useQuery({
    queryKey: ['community', 'leaderboard'],
    queryFn: async () => {
      const { data } = await apiClient.get<LeaderboardEntry[]>('/community/leaderboard');
      return data;
    },
  });
}
