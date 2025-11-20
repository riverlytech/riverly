import { ServerDeployment } from '@riverly/riverly'

export type UserDeploymentDetail = Awaited<
  ReturnType<typeof ServerDeployment.orgDeployment>
>
