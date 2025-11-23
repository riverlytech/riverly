import { fn } from "@riverly/utils";
import { and, asc, eq, or } from "drizzle-orm";
import { nanoid } from "nanoid";
import { App as GhApp } from "octokit";
import z from "zod/v4";
import { Database } from "@riverly/db";
import { type GitHubAccountType, gitHubInstallationTable } from "@riverly/db";
import { type ServerReadme } from "@riverly/ty";
import { env } from "@riverly/config";

let ghApp: GhApp | undefined;

function getGhApp() {
  if (!ghApp) {
    ghApp = new GhApp({
      appId: env.GITHUB_APP_ID,
      privateKey: Buffer.from(env.GITHUB_PRIVATE_KEY_BASE64, "base64").toString(
        "utf8"
      ),
    });
  }
  return ghApp;
}

export namespace GitHub {
  export async function installationDetails(githubInstallationId: number) {
    function isUserOrOrg(
      account: any
    ): account is { login: string; id: number; type: string } {
      return account && typeof account.login === "string";
    }

    const response = await getGhApp().octokit.rest.apps.getInstallation({
      installation_id: githubInstallationId,
    });

    return {
      accountId: response.data.target_id,
      accountLogin: isUserOrOrg(response.data.account)
        ? response.data.account.login
        : nanoid(), // API nuances!
      accountType: response.data.target_type,
    };
  }

  export const upsertApp = fn(
    z.object({
      organizationId: z.string(),
      githubInstallationId: z.number(),
      githubAppId: z.number(),
      accountId: z.number(),
      accountLogin: z.string(),
      accountType: z.string(),
      setupAction: z.string(),
    }),
    async (gh) =>
      await Database.transaction(async (tx) => {
        // Delete by primary key first (handles any existing installation with same ID)
        await tx
          .delete(gitHubInstallationTable)
          .where(
            eq(
              gitHubInstallationTable.githubInstallationId,
              gh.githubInstallationId
            )
          );

        // Then delete any existing installation for this user+account combination
        // This handles uninstall/reinstall scenarios where installationId changes
        await tx
          .delete(gitHubInstallationTable)
          .where(
            and(
              eq(gitHubInstallationTable.githubAppId, gh.githubAppId),
              eq(gitHubInstallationTable.organizationId, gh.organizationId),
              or(
                eq(gitHubInstallationTable.accountLogin, gh.accountLogin),
                eq(gitHubInstallationTable.accountId, gh.accountId)
              )
            )
          );

        // Then insert the new/updated installation
        return tx
          .insert(gitHubInstallationTable)
          .values({
            githubInstallationId: gh.githubInstallationId,
            githubAppId: gh.githubAppId,
            accountId: gh.accountId,
            accountLogin: gh.accountLogin,
            accountType: gh.accountType as GitHubAccountType,
            organizationId: gh.organizationId,
          })
          .returning({
            id: gitHubInstallationTable.githubInstallationId,
          })
          .execute()
          .then((row) => row[0]?.id);
      })
  );

  export const orgInstallation = fn(
    z.object({
      organizationId: z.string(),
      githubAppId: z.number(),
      account: z.string(),
    }),
    async (filter) => {
      return await Database.use(async (db) => {
        return await db
          .select({
            githubInstallationId: gitHubInstallationTable.githubInstallationId,
            githubAppId: gitHubInstallationTable.githubAppId,
            accountLogin: gitHubInstallationTable.accountLogin,
            accountType: gitHubInstallationTable.accountType,
            createdAt: gitHubInstallationTable.createdAt,
            updatedAt: gitHubInstallationTable.updatedAt,
          })
          .from(gitHubInstallationTable)
          .where(
            and(
              eq(gitHubInstallationTable.githubAppId, filter.githubAppId),
              eq(gitHubInstallationTable.organizationId, filter.organizationId),
              eq(gitHubInstallationTable.accountLogin, filter.account)
            )
          )
          .execute()
          .then((rows) => rows[0] ?? null);
      });
    }
  );

  export const orgInstalls = fn(
    z.object({ organizationId: z.string(), githubAppId: z.number() }),
    async (filter) =>
      await Database.use(async (db) =>
        db
          .select({
            githubInstallationId: gitHubInstallationTable.githubInstallationId,
            githubAppId: gitHubInstallationTable.githubAppId,
            accountLogin: gitHubInstallationTable.accountLogin,
            accountType: gitHubInstallationTable.accountType,
            createdAt: gitHubInstallationTable.createdAt,
            updatedAt: gitHubInstallationTable.updatedAt,
          })
          .from(gitHubInstallationTable)
          .where(
            and(
              eq(gitHubInstallationTable.githubAppId, filter.githubAppId),
              eq(gitHubInstallationTable.organizationId, filter.organizationId)
            )
          )
          .orderBy(asc(gitHubInstallationTable.createdAt))
          .limit(25)
      )
  );

  export const repos = fn(z.number(), async (githubInstallationId) => {
    const octokit =
      await getGhApp().getInstallationOctokit(githubInstallationId);
    const repos = await octokit.paginate(
      octokit.rest.apps.listReposAccessibleToInstallation,
      {
        installation_id: githubInstallationId,
        per_page: 100,
      }
    );
    return repos.map((r) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name, // e.g. "sanchitrk/foobar"
      private: r.private,
      defaultBranch: r.default_branch,
      htmlUrl: r.html_url,
      cloneUrl: r.clone_url,
      permissions: r.permissions,
      owner: r.owner.login,
    }));
  });

  export const repoDetail = fn(
    z.object({
      githubInstallationId: z.number(),
      owner: z.string(),
      repo: z.string(),
    }),
    async (q) => {
      try {
        const octokit = await getGhApp().getInstallationOctokit(
          q.githubInstallationId
        );
        const { data } = await octokit.rest.repos.get({
          owner: q.owner,
          repo: q.repo,
        });
        const { owner } = data;
        return {
          id: data.id,
          name: data.name,
          fullName: data.full_name,
          private: data.private,
          defaultBranch: data.default_branch,
          htmlUrl: data.html_url,
          cloneUrl: data.clone_url,
          permissions: data.permissions,
          license: data.license,
          owner,
        };
      } catch (error) {
        return null;
      }
    }
  );

  export const repoReadme = fn(
    z.object({
      githubInstallationId: z.number(),
      username: z.string(),
      name: z.string(),
    }),
    async (repo) => {
      const octokit = await getGhApp().getInstallationOctokit(
        repo.githubInstallationId
      );
      const { data } = await octokit.rest.repos.getReadme({
        owner: repo.username,
        repo: repo.name,
      });
      return {
        sha: data.sha,
        gitHtmlUrl: data.html_url ?? undefined,
        gitUrl: data.git_url ?? undefined,
        gitDownloadUrl: data.download_url ?? undefined,
      } as ServerReadme;
    }
  );

  export const repoReadmeContent = fn(
    z.object({
      githubInstallationId: z.number(),
      owner: z.string(),
      repo: z.string(),
    }),
    async (readme) => {
      const octokit = await getGhApp().getInstallationOctokit(
        readme.githubInstallationId
      );
      try {
        const { data } = await octokit.rest.repos.getReadme({
          owner: readme.owner,
          repo: readme.repo,
          mediaType: {
            format: "raw",
          },
        });
        if (typeof data === "string") return data;
        // Fallback if Octokit returns the encoded payload instead of raw text
        const content = (data as { content?: string }).content;
        if (!content) return null;
        return Buffer.from(content, "base64").toString("utf-8");
      } catch (error) {
        return null;
      }
    }
  );

  export const repoLatestCommitHash = fn(
    z.object({
      githubInstallationId: z.number(),
      owner: z.string(),
      repo: z.string(),
      branch: z.string(),
    }),
    async (r) => {
      const octokit = await getGhApp().getInstallationOctokit(
        r.githubInstallationId
      );

      const { data } = await octokit.rest.git.getRef({
        owner: r.owner,
        repo: r.repo,
        ref: `heads/${r.branch}`,
      });
      return data.object.sha;
    }
  );

  export type OrgInstalls = Awaited<ReturnType<typeof orgInstalls>>;
}
