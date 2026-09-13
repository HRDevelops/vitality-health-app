import { useQuery } from '@tanstack/react-query';
import { apiClient } from './client';
import { AchievementSummaryResponse } from '../../types/domain';

export function useAchievements() {
  return useQuery<AchievementSummaryResponse>({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data } = await apiClient.get<AchievementSummaryResponse>('/achievements');
      return data;
    },
    staleTime: 30000,
  });
}
