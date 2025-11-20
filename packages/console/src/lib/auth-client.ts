import { organizationClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

import { type SelectUser } from '@riverly/db'

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BASE_URL,
  plugins: [organizationClient()],
})

export const toSession = (user: SelectUser) => {
  const image = user.image || `https://avatar.vercel.sh/${user.username}`
  return {
    userId: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    emailVerified: user.emailVerified,
    image: image,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    defaultOrgId: user.defaultOrgId,
  }
}
