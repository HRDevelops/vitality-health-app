import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import { ProductScan, DailyNutritionSummary } from '../../types/domain';

export function useDailyNutritionSummary() {
  return useQuery<DailyNutritionSummary>({
    queryKey: ['scans', 'daily-summary'],
    queryFn: async () => {
      const { data } = await apiClient.get<DailyNutritionSummary>('/scans/daily-summary');
      return data;
    },
    staleTime: 30000,
  });
}

export function useLogMealScan() {
  const queryClient = useQueryClient();
  return useMutation<
    ProductScan,
    Error,
    {
      name?: string;
      imageUrl?: string;
      sodiumMg?: number;
      calories?: number;
      cookingMode?: boolean;
      notes?: string;
    }
  >({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post<ProductScan>('/scans/meal', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useLogProductScan() {
  const queryClient = useQueryClient();
  return useMutation<
    ProductScan,
    Error,
    {
      name?: string;
      barcode?: string;
      imageUrl?: string;
      ocrRawText?: string;
      sodiumMg?: number;
      calories?: number;
      notes?: string;
    }
  >({
    mutationFn: async (payload) => {
      const { data } = await apiClient.post<ProductScan>('/scans/product', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
