import { Database } from "@riverly/db";
import { users } from "@riverly/db";
import { eq, and } from "drizzle-orm";
import { fn } from "@riverly/utils";
import z from "zod/v4";
import { sessionUserSchema } from "@riverly/ty";

export namespace Workspace {
  export const fromSlug = fn(z.string(), async (slug) =>
    Database.transaction(async (tx) => {
      return tx
        .select({
          userId: users.id,
          username: users.username,
          image: users.image,
          name: users.name,
          type: users.type,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.username, slug))
        .execute()
        .then((rows) => rows.at(0));
    })
  );

  //
  // For now, we only support personal workspace
  // Keeping org features for future use.
  // Modify for org requires permission and roles
  export const withMembership = fn(
    z.object({ slug: z.string(), sessionUser: sessionUserSchema }),
    async (filter) =>
      Database.transaction(async (tx) => {
        const [userOrOrg] = await tx
          .select({
            userId: users.id,
            username: users.username,
            image: users.image,
            name: users.name,
            type: users.type,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
          })
          .from(users)
          .where(
            and(
              eq(users.id, filter.sessionUser.userId),
              eq(users.username, filter.slug)
            )
          );

        if (!userOrOrg) return null;
        return {
          ...userOrOrg,
          isSelf: true,
        };
      })
  );
  export type WithMembership = Awaited<ReturnType<typeof withMembership>>;
  export type WorkspaceWithMembership = NonNullable<
    Awaited<ReturnType<typeof withMembership>>
  >;
}
