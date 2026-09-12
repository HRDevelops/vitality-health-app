import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { HealthMetric, HealthMetricSummary, CreateHealthMetricInput, HealthMetricType } from '../../types/domain';

export async function getHealthMetrics(filters?: { type?: HealthMetricType; limit?: number }) {
  const { data } = await apiClient.get<HealthMetric[]>('/health-metrics', { params: filters });
  return data;
}

export async function getHealthMetricSummary() {
  const { data } = await apiClient.get<HealthMetricSummary>('/health-metrics/summary');
  return data;
}

export async function createHealthMetric(input: CreateHealthMetricInput) {
  const { data } = await apiClient.post<HealthMetric>('/health-metrics', input);
  return data;
}

export function useHealthMetrics(filters?: { type?: HealthMetricType; limit?: number }) {
  return useQuery({
    queryKey: ['health-metrics', filters],
    queryFn: () => getHealthMetrics(filters),
  });
}

export function useHealthMetricSummary() {
  return useQuery({
    queryKey: ['health-metrics', 'summary'],
    queryFn: getHealthMetricSummary,
  });
}

export function useCreateHealthMetric() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateHealthMetricInput) => createHealthMetric(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-metrics'] });
    },
  });
}
