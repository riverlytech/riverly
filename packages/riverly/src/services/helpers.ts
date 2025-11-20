import { fn } from "@riverly/utils";
import { SelectUser } from "@riverly/db";

export function parseRepoUrl(
  repoUrl: string
): [Error | null, { owner: string; repo: string } | null] {
  const normalizedUrl = repoUrl.startsWith("http")
    ? repoUrl
    : `https://github.com/${repoUrl}`;

  const url = new URL(normalizedUrl);
  const parts = url.pathname.split("/").filter(Boolean);

  if (parts.length !== 2) {
    return [
      new Error(
        "Repository URL must include only organization and repo name, e.g., https://github.com/org/repo"
      ),
      null,
    ];
  }

  const owner = parts[0]!;
  const repo = parts[1]!.replace(/\.git$/, "");

  return [null, { owner: owner, repo: repo }];
}

//
// Owner: sanchitrk
// input: sanchitrk/foobar converts -> sanchitrk/foobar
// input: foobar converts -> sanchitrk/foobar
//
// Non-Owner - xyz
// input: sanchitrk/foobar converts -> sanchitrk/foobar
// input: foobar converts -> xyz/foobar
export function parseAbsName(username: string, name: string): [string, string] {
  const parts = name.split("/").filter((p) => p.length > 0);
  if (parts.length === 2) {
    return [parts[0] || username, parts[1] || name];
  }
  return [username, name];
}

export const toSession = fn(SelectUser, (user) => {
  const image = user.image || `https://avatar.vercel.sh/${user.username}`;
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
  };
});
