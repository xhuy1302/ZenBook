import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { useEffect } from 'react'
import { toast } from 'sonner'

export function useFetchData<TData>(
  key: string | unknown[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>
) {
  const query = useQuery<TData>({
    queryKey: Array.isArray(key) ? key : [key],
    queryFn: queryFn,
    ...options
  })

  useEffect(() => {
    if (query.isError) {
      toast.error('Load data failed')
    }
  }, [query.isError])

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError
  }
}
