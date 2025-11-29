import useSWR from 'swr'

import type { GitHub } from '@riverly/riverly'

const fetcher = (
  ...args: [RequestInfo, RequestInit?]
): Promise<{ installs: GitHub.OrgInstalls }> =>
  fetch(...args).then((res) => res.json())

export function useGitHubInstalls(organizationId: string) {
  const q = new URLSearchParams({
    ...(organizationId && { organizationId }),
  })
  const url = `/api/github/installs${q.size ? `?${q}` : ''}`

  const { data, error, isLoading, mutate } = useSWR(url, fetcher)
  return {
    data: data,
    isLoading,
    isError: error,
    mutate,
  }
}
