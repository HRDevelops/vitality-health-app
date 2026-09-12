import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import {
  MonitoredMember,
  MemberVitalHistoryResponse,
  RelationshipType,
} from '../../types/domain';

export async function getMonitoredMembers() {
  const { data } = await apiClient.get<MonitoredMember[]>('/care-circle/members');
  return data;
}

export async function getMemberVitals(subjectId: string, limit = 30) {
  const { data } = await apiClient.get<MemberVitalHistoryResponse>(
    `/care-circle/members/${subjectId}/vitals`,
    { params: { limit } }
  );
  return data;
}

export async function generateInviteCode(relationshipType?: RelationshipType) {
  const { data } = await apiClient.post<{ inviteCode: string; relationshipType: RelationshipType }>(
    '/care-circle/generate-code',
    { relationshipType }
  );
  return data;
}

export async function connectWithCode(input: {
  inviteCode: string;
  relationshipType?: RelationshipType;
}) {
  const { data } = await apiClient.post<{
    message: string;
    member: MonitoredMember;
  }>('/care-circle/connect', input);
  return data;
}

export async function revokeLink(linkId: string) {
  const { data } = await apiClient.delete<{ success: boolean; message: string }>(
    `/care-circle/links/${linkId}`
  );
  return data;
}

// React Query Hooks
export function useCareCircleMembers() {
  return useQuery({
    queryKey: ['careCircle', 'members'],
    queryFn: getMonitoredMembers,
  });
}

export function useMemberVitals(subjectId: string | null, limit = 30) {
  return useQuery({
    queryKey: ['careCircle', 'memberVitals', subjectId, limit],
    queryFn: () => getMemberVitals(subjectId!, limit),
    enabled: !!subjectId,
  });
}

export function useConnectCareCircle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { inviteCode: string; relationshipType?: RelationshipType }) =>
      connectWithCode(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careCircle'] });
    },
  });
}

export function useGenerateInviteCode() {
  return useMutation({
    mutationFn: (relationshipType?: RelationshipType) => generateInviteCode(relationshipType),
  });
}

export function useRevokeLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (linkId: string) => revokeLink(linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careCircle'] });
    },
  });
}
