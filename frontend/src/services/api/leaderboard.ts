import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import {
  LeaderboardResponse,
  LeaderboardTimeframe,
  University,
  Team,
} from '../../types/domain';

export async function getIndividualLeaderboard(timeframe: LeaderboardTimeframe = 'all_time') {
  const { data } = await apiClient.get<LeaderboardResponse>('/leaderboards/individual', {
    params: { timeframe },
  });
  return data;
}

export async function getTeamLeaderboard(
  timeframe: LeaderboardTimeframe = 'all_time',
  universityId?: string
) {
  const { data } = await apiClient.get<LeaderboardResponse>('/leaderboards/teams', {
    params: { timeframe, universityId },
  });
  return data;
}

export async function getUniversityLeaderboard(timeframe: LeaderboardTimeframe = 'all_time') {
  const { data } = await apiClient.get<LeaderboardResponse>('/leaderboards/universities', {
    params: { timeframe },
  });
  return data;
}

export async function getUniversities() {
  const { data } = await apiClient.get<University[]>('/leaderboards/universities/list');
  return data;
}

export async function getTeams(universityId?: string) {
  const { data } = await apiClient.get<Team[]>('/leaderboards/teams/list', {
    params: { universityId },
  });
  return data;
}

export async function joinTeam(teamId: string) {
  const { data } = await apiClient.post('/leaderboards/teams/join', { teamId });
  return data;
}

export async function createTeam(input: { name: string; universityId: string }) {
  const { data } = await apiClient.post('/leaderboards/teams', input);
  return data;
}

// React Query Hooks
export function useIndividualLeaderboard(timeframe: LeaderboardTimeframe = 'all_time') {
  return useQuery({
    queryKey: ['leaderboard', 'individual', timeframe],
    queryFn: () => getIndividualLeaderboard(timeframe),
  });
}

export function useTeamLeaderboard(
  timeframe: LeaderboardTimeframe = 'all_time',
  universityId?: string
) {
  return useQuery({
    queryKey: ['leaderboard', 'teams', timeframe, universityId],
    queryFn: () => getTeamLeaderboard(timeframe, universityId),
  });
}

export function useUniversityLeaderboard(timeframe: LeaderboardTimeframe = 'all_time') {
  return useQuery({
    queryKey: ['leaderboard', 'universities', timeframe],
    queryFn: () => getUniversityLeaderboard(timeframe),
  });
}

export function useUniversities() {
  return useQuery({
    queryKey: ['universities'],
    queryFn: getUniversities,
  });
}

export function useTeams(universityId?: string) {
  return useQuery({
    queryKey: ['teams', universityId],
    queryFn: () => getTeams(universityId),
  });
}

export function useJoinTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId: string) => joinTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; universityId: string }) => createTeam(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}
