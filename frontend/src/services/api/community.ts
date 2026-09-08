import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import { LeaderboardEntry } from '../../types/domain';

export type LeaderboardRange = 'today' | 'week';

export function useLeaderboard(range: LeaderboardRange = 'today') {
  return useQuery({
    queryKey: ['community', 'leaderboard', range],
    queryFn: async () => {
      const { data } = await apiClient.get<LeaderboardEntry[]>('/community/leaderboard', { params: { range } });
      return data;
    },
  });
}
