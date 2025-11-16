import {
  pgTable,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { genId } from "@riverly/utils";
import { type UserRole as UserRoleType, UserRole } from "../../ty";
import { users } from "./users";
import z from "zod/v4";

export const organizationMemberTable = pgTable(
  "organiztion_member",
  {
    membershipId: varchar("membership_id", { length: 255 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => genId()),
    orgId: varchar("org_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 255 })
      .references(() => users.id)
      .notNull(),
    role: varchar("role", { length: 64 })
      .$type<UserRoleType>()
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    unique("organiztion_member_org_id_user_id_key").on(table.orgId, table.userId)
  ]
);

export const CreateUserMembership = createInsertSchema(organizationMemberTable, {
  orgId: z.string(),
  userId: z.string(),
  role: UserRole,
});

