import type { DeploymentEvent, GitHubSourceDeployer } from "../ty.ts";


export interface IGitHubDeployer {
  deploy(args: GitHubSourceDeployer): Promise<DeploymentEvent>;
}

