import {
  boolean,
  pgTable,
  text,
  timestamp,
  varchar,
  unique,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { createSchemaFactory } from "drizzle-zod";
import z from "zod/v4";

import { genId } from "@riverly/utils";

const { createSelectSchema, createUpdateSchema, createInsertSchema } = createSchemaFactory({
  zodInstance: z,
});

export const users = pgTable("user", {
  id: varchar("id", { length: 255 }).primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: varchar("image", { length: 511 }),
  username: varchar("username", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  defaultOrgId: text("default_org_id").references(() => organizations.id, {
    onDelete: "set null",
  }),
});

export const SelectUser = createSelectSchema(users);
export const UpdateUser = createUpdateSchema(users);

export type SelectUser = z.infer<typeof SelectUser>;
export type UserTable = typeof users.$inferSelect;

export const sessions = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  activeOrganizationId: text("active_organization_id"),
});

export const accounts = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verifications = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const jwks = pgTable("jwk", {
  id: text("id").primaryKey(),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const organizations = pgTable("organization", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => genId()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  metadata: text("metadata"),
});

export const SelectOrganization = createSelectSchema(organizations);
export const UpdateOrganization = createUpdateSchema(organizations);
export const InsertOrganization = createInsertSchema(organizations);

export type SelectOrganization = z.infer<typeof SelectUser>;
export type OrganizationTable = typeof organizations.$inferSelect;

export const members = pgTable(
  "member",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => genId()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").default("member").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [unique("member_organization_id_user_id_key").on(table.organizationId, table.userId)],
);

export const SelectMember = createSelectSchema(members);
export const UpdateMember = createUpdateSchema(members);
export const InsertMember = createInsertSchema(members);

export type SelectMember = z.infer<typeof SelectMember>;
export type MemberTable = typeof organizations.$inferSelect;

export const invitations = pgTable("invitation", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").default("pending").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const apikey = pgTable("apikey", {
  id: text("id").primaryKey(),
  name: text("name"),
  start: text("start"),
  prefix: text("prefix"),
  key: text("key").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organizations.id, { onDelete: "cascade" }),
  refillInterval: integer("refill_interval"),
  refillAmount: integer("refill_amount"),
  lastRefillAt: timestamp("last_refill_at"),
  enabled: boolean("enabled").default(true),
  rateLimitEnabled: boolean("rate_limit_enabled").default(true),
  rateLimitTimeWindow: integer("rate_limit_time_window").default(86400000),
  rateLimitMax: integer("rate_limit_max").default(10),
  requestCount: integer("request_count").default(0),
  remaining: integer("remaining"),
  lastRequest: timestamp("last_request"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  permissions: jsonb("permissions"),
  metadata: jsonb("metadata"),
});
