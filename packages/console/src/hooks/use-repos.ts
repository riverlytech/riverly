import useSWR from 'swr'

import type { GitHubRepo } from '@riverly/ty'

const fetcher = (
  ...args: [RequestInfo, RequestInit?]
): Promise<{ repos: Array<GitHubRepo>; isInstalled: boolean }> =>
  fetch(...args).then((res) => res.json())

export function useRepos(organizationId: string, owner?: string) {
  const q = new URLSearchParams({
    ...(owner && { owner }),
    ...(organizationId && { organizationId }),
  })

  const url = owner && `/api/github/repos${q.size ? `?${q}` : ''}`
  const { data, error, isLoading, mutate } = useSWR(url, fetcher)

  return {
    data: data,
    isLoading,
    isError: error,
    mutate,
  }
}
