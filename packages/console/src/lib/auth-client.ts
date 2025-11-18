import { organizationClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

import { type SelectUser } from '@riverly/db'

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BASE_URL,
  plugins: [organizationClient()],
})

export const toSession = (user: SelectUser) => {
  const avatarUrl = user.image || `https://avatar.vercel.sh/${user.username}`
  return {
    userId: user.id,
    name: user.name,
    username: user.username,
    githubId: user.githubId,
    email: user.email,
    emailVerified: user.emailVerified,
    isStaff: user.isStaff,
    isBlocked: user.isBlocked,
    image: avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}
