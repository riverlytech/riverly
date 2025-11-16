import { Database } from "@riverly/db";
import { eq, and } from "drizzle-orm";
import { users, UpdateUser, UserType } from "@riverly/db";
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
        .where(and(eq(users.username, username), eq(users.type, UserType.USER)))
        .execute()
        .then((rows) => rows.at(0));
    })
  );

  export const fromID = fn(z.string(), async (id) =>
    Database.transaction(async (tx) => {
      return tx
        .select()
        .from(users)
        .where(eq(users.id, id))
        .execute()
        .then((rows) => rows[0]);
    })
  );

  export const update = fn(
    UpdateUser.extend({ id: z.string() }),
    async (updates) =>
      Database.transaction(async (tx) => {
        const { id, ...values } = updates;
        return tx
          .update(users)
          .set({ ...values })
          .where(eq(users.id, updates.id))
          .execute();
      })
  );
}
