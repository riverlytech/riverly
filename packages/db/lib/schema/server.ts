import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { ulid } from "ulid";
import z from "zod/v4";
import { genId } from "@riverly/utils";
import {
  type ServerLicense as ServerLicenseType,
  type ServerReadme as ServerReadmeType,
  type Envs,
  type ServerConfig,
  EnvsSchema,
  ServerConfigSchema,
  ServerLicenseSchema,
  ServerReadmeSchema,
  ServerMode,
  ServerModeEnum,
  ServerTransport,
  ServerTransportEnum,
  ServerVisibility,
  ServerVisibilityEnum,
} from "@riverly/ty";
import { members, organizations } from "./users";

export const serverTable = pgTable("server", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .notNull()
    .$defaultFn(() => genId()),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  image: text("image"),
  verified: boolean("is_claimed").default(false).notNull(),
  usageCount: integer("usage_count").default(0).notNull(),
  visibility: varchar("visibility", { length: 64 }).$type<ServerVisibility>().notNull(),
  // repository
  githubRepo: varchar("github_repo", { length: 255 }),
  githubOwner: varchar("github_owner", { length: 255 }),
  githubRepositoryId: integer("github_repository_id"),
  branch: varchar("branch", { length: 255 }),
  // runtime
  mode: varchar("mode", { length: 64 }).$type<ServerMode>().notNull(),
  transport: varchar("transport", { length: 64 }).$type<ServerTransport>().notNull(),
  // ownership
  organizationId: text("organization_id")
    .references(() => organizations.id)
    .notNull(),
  memberId: text("member_id")
    .references(() => members.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // public
  readme: jsonb("readme").$type<ServerReadmeType>(),
  license: jsonb("license").$type<ServerLicenseType>(),
});

// Represents full scheam for insert for a server
// other schemas are derived from this.
export const CreateServer = createInsertSchema(serverTable, {
  title: z.string(),
  description: z.string().optional().default(""),
  image: z.url().optional(),
  verified: z.boolean().optional(),
  usageCount: z.number().optional(),
  visibility: z
    .enum([ServerVisibilityEnum.PRIVATE, ServerVisibilityEnum.PUBLIC])
    .optional()
    .default(ServerVisibilityEnum.PRIVATE),
  githubRepo: z.string().optional(),
  githubOwner: z.string().optional(),
  branch: z.string().optional(),
  githubRepositoryId: z.number().optional(),
  mode: z
    .enum([ServerModeEnum.REMOTE, ServerModeEnum.LOCAL])
    .optional()
    .default(ServerModeEnum.REMOTE),
  transport: z
    .enum([ServerTransportEnum.HTTP, ServerTransportEnum.STDIO])
    .optional()
    .default(ServerTransportEnum.HTTP),
  organizationId: z.string(),
  memberId: z.string(),
  readme: ServerReadmeSchema.optional(),
  license: ServerLicenseSchema.optional(),
});

export const SelectServer = createSelectSchema(serverTable, {
  visibility: ServerVisibility,
  mode: ServerMode,
  transport: ServerTransport,
  readme: ServerReadmeSchema.nullable(),
  license: ServerLicenseSchema.nullable(),
});

// Derived schema from main schema for creating server
// with API.
export const AddServer = CreateServer.pick({
  title: true,
  visibility: true,
  organizationId: true,
  memberId: true,
})
  .required()
  .extend({
    description: z.string().optional(),
    image: z.string().optional(),
  });

// Derived schema from main schema for creating
// server from GitHub linked repository.
export const GitHubCreateServer = CreateServer.pick({
  title: true,
  visibility: true,
  githubRepositoryId: true,
  githubOwner: true,
  githubRepo: true,
  branch: true,
  organizationId: true,
  memberId: true,
})
  .required()
  .extend({
    description: z.string().optional(),
    image: z.string().optional(),
    license: ServerLicenseSchema.optional(),
    readme: ServerReadmeSchema.optional(),
  });

// Derived schema for initializing adding a server from GitHub
// with additional attributes required for fetching repository details.
export const GitHubImportServer = AddServer.required().extend({
  repoUrl: z.string(), // required for fetching repo details
  description: z.string().optional(),
  image: z.string().optional(),
});

export const serverConfigTable = pgTable("server_config", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .references(() => serverTable.id, { onDelete: "cascade" }),
  revision: varchar("revision", { length: 128 })
    .notNull()
    .$defaultFn(() => ulid().toLowerCase()),
  envs: jsonb("envs").$type<Envs>().notNull().default([]),
  config: jsonb("config").$type<ServerConfig>().notNull().default({}),
  configHash: varchar("config_hash", { length: 511 }).notNull(),
  rootDir: varchar("root_dir", { length: 255 }).default("./").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ServerConfigTable = typeof serverConfigTable.$inferSelect;

export const InsertServerConfig = createInsertSchema(serverConfigTable, {
  id: z.string(),
  envs: EnvsSchema.optional(),
  config: ServerConfigSchema.optional(),
  configHash: z.string(),
  rootDir: z.string().optional().default("./"),
});

export const UpsertServerConfig = InsertServerConfig.omit({
  configHash: true,
});

export type UpsertServerConfig = z.infer<typeof UpsertServerConfig>;

export const serverInstallTable = pgTable(
  "server_install",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => genId()),
    organizationId: text("organization_id")
      .references(() => organizations.id, { onDelete: "cascade" })
      .notNull(),
    serverId: varchar("server_id", { length: 255 })
      .notNull()
      .references(() => serverTable.id, { onDelete: "cascade" }),
    usageCount: integer("usage_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    unique("server_install_organization_id_server_id_key").on(table.organizationId, table.serverId),
  ],
);
