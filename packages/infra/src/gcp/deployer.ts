import type { DeploymentEvent, GitHubSourceDeployer } from "../ty";

export interface IGitHubDeployer {
  deploy(args: GitHubSourceDeployer): Promise<DeploymentEvent>;
}
