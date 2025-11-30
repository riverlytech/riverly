import { Database } from "@riverly/db";
import { eq } from "drizzle-orm";
import { users, UpdateUser, organizations } from "@riverly/db";
import { fn } from "@riverly/utils";
import z from "zod/v4";

export namespace User {
  export const fromUsername = fn(z.string(), async (username) =>
    Database.transaction(async (tx) => {
      return tx
        .select({
          userId: users.id,
          username: users.username,
          image: users.image,
          name: users.name,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.username, username))
        .execute()
        .then((rows) => rows[0] ?? null);
    }),
  );

  export const fromID = fn(z.string(), async (id) =>
    Database.transaction(async (tx) => {
      return tx
        .select()
        .from(users)
        .where(eq(users.id, id))
        .execute()
        .then((rows) => rows[0] ?? null);
    }),
  );

  export const fromIDWithDefaultOrg = fn(z.string(), async (id) =>
    Database.transaction(async (tx) => {
      return tx
        .select({
          userId: users.id,
          username: users.username,
          image: users.image,
          name: users.name,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          defaultOrg: {
            orgId: organizations.id,
            name: organizations.name,
            slug: organizations.slug,
            logo: organizations.logo,
          },
        })
        .from(users)
        .innerJoin(organizations, eq(users.defaultOrgId, organizations.id))
        .where(eq(users.id, id))
        .execute()
        .then((rows) => rows[0] ?? null);
    }),
  );

  export const update = fn(UpdateUser.extend({ id: z.string() }), async (updates) =>
    Database.transaction(async (tx) => {
      const { id, ...values } = updates;
      return tx
        .update(users)
        .set({ ...values })
        .where(eq(users.id, updates.id))
        .execute();
    }),
  );
}
