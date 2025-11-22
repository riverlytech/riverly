import { Database } from "@riverly/db";
import { eq, desc, and } from "drizzle-orm";
import { organizations, members, InsertOrganization, users } from "@riverly/db";
import { fn, NamedError } from "@riverly/utils";
import z from "zod/v4";

export const CreateOrgError = NamedError.create(
  "CreateOrgError",
  z.object({
    message: z.string(),
  })
);

export const CreateOrgMembershipError = NamedError.create(
  "CreateOrgMembershipError",
  z.object({
    message: z.string(),
  })
);

export namespace Organization {
  export const fromID = fn(z.string(), async (id) =>
    Database.transaction(async (tx) => {
      return tx
        .select()
        .from(organizations)
        .where(eq(organizations.id, id))
        .execute()
        .then((rows) => rows[0]);
    })
  );

  export const insert = fn(InsertOrganization, async (values) =>
    Database.transaction(async (tx) => {
      return tx
        .insert(organizations)
        .values({ ...values })
        .execute();
    })
  );

  export const createDefaultOrg = fn(
    z.object({ org: InsertOrganization, userId: z.string() }),
    async (values) =>
      Database.transaction(async (tx) => {
        const { org, userId } = values;
        const createdOrg = await tx
          .insert(organizations)
          .values({ ...org })
          .returning()
          .execute()
          .then((row) => row[0]);

        if (!createdOrg)
          throw new CreateOrgError({ message: "Failed to create org" });

        const [membership] = await tx
          .insert(members)
          .values({
            organizationId: createdOrg.id,
            userId: userId,
            role: "owner",
          })
          .returning();

        if (!membership)
          throw new CreateOrgMembershipError({
            message: "Failed to create org membership",
          });

        await tx
          .update(users)
          .set({ defaultOrgId: createdOrg.id })
          .where(eq(users.id, userId))
          .execute();

        return {
          organizationId: createdOrg.id,
          memberId: membership.id,
        };
      })
  );

  export const memberOrgs = fn(
    z.object({ userId: z.string(), limit: z.number().default(100) }),
    async (filters) => {
      return await Database.use(async (db) => {
        const items = await db
          .select({
            name: organizations.name,
            slug: organizations.slug,
            logo: organizations.logo,
            role: members.role,
          })
          .from(members)
          .innerJoin(
            organizations,
            eq(members.organizationId, organizations.id)
          )
          .where(eq(members.userId, filters.userId))
          .orderBy(desc(organizations.createdAt))
          .limit(filters.limit);
        return items;
      });
    }
  );

  export const orgMembershipFromID = fn(
    z.object({ organizationId: z.string(), userId: z.string() }),
    async (filters) => {
      return await Database.use(async (db) => {
        return db
          .select({
            id: members.id,
            role: members.role,
            org: {
              id: organizations.id,
              name: organizations.name,
              slug: organizations.slug,
              logo: organizations.logo,
              createdAt: organizations.createdAt,
              metadata: organizations.metadata,
            },
            user: {
              id: users.id,
              name: users.name,
              email: users.email,
              emailVerified: users.emailVerified,
              image: users.image,
              username: users.username,
              createdAt: users.createdAt,
              defaultOrgId: users.defaultOrgId,
            },
          })
          .from(members)
          .innerJoin(
            organizations,
            eq(members.organizationId, organizations.id)
          )
          .innerJoin(users, eq(members.userId, users.id))
          .where(
            and(
              eq(organizations.id, filters.organizationId),
              eq(members.userId, filters.userId)
            )
          )
          .execute()
          .then((row) => row[0] ?? null);
      });
    }
  );

  export const orgMembership = fn(
    z.object({ slug: z.string(), userId: z.string() }),
    async (filters) => {
      return await Database.use(async (db) => {
        return db
          .select({
            id: members.id,
            role: members.role,
            org: {
              id: organizations.id,
              name: organizations.name,
              slug: organizations.slug,
              logo: organizations.logo,
              createdAt: organizations.createdAt,
              metadata: organizations.metadata,
            },
            user: {
              id: users.id,
              name: users.name,
              email: users.email,
              emailVerified: users.emailVerified,
              image: users.image,
              username: users.username,
              createdAt: users.createdAt,
              defaultOrgId: users.defaultOrgId,
            },
          })
          .from(members)
          .innerJoin(
            organizations,
            eq(members.organizationId, organizations.id)
          )
          .innerJoin(users, eq(members.userId, users.id))
          .where(
            and(
              eq(organizations.slug, filters.slug),
              eq(members.userId, filters.userId)
            )
          )
          .execute()
          .then((row) => row[0] ?? null);
      });
    }
  );
}
