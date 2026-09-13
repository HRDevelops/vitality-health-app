import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { MoveActivity, MoveSummary, LogMoveActivityInput, MoveActivityType } from '../../types/domain';

export async function logMoveActivity(input: LogMoveActivityInput) {
  const { data } = await apiClient.post<MoveActivity>('/move/activity', input);
  return data;
}

export async function getMoveActivities(filters?: {
  activityType?: MoveActivityType;
  isFlagged?: boolean;
  limit?: number;
}) {
  const { data } = await apiClient.get<MoveActivity[]>('/move/activities', { params: filters });
  return data;
}

export async function getMoveSummary() {
  const { data } = await apiClient.get<MoveSummary>('/move/summary');
  return data;
}

export function useMoveActivities(filters?: {
  activityType?: MoveActivityType;
  isFlagged?: boolean;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['move', 'activities', filters],
    queryFn: () => getMoveActivities(filters),
  });
}

export function useMoveSummary() {
  return useQuery({
    queryKey: ['move', 'summary'],
    queryFn: getMoveSummary,
  });
}

export function useLogMoveActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LogMoveActivityInput) => logMoveActivity(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['move'] });
    },
  });
}
