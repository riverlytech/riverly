import { boolean, jsonb, pgTable, text, timestamp, unique, varchar } from "drizzle-orm/pg-core";
import { createSchemaFactory } from "drizzle-zod";
import { ulid } from "ulid";
import z from "zod/v4";
import { genId } from "@riverly/utils";
import {
  EnvsSchema,
  ServerConfigSchema,
  type ServerConfig as ServerConfigType,
  type Envs as EnvsType,
  DeploymentStatusEnum,
  DeploymentStatus,
  type DeploymentStatusType,
  deploymentTargetSchema,
  type DeploymentTargetType,
  type RevisionStatus,
  RevisionStatusSchema,
  RevisionStatusValue,
  type TriggerType,
  triggerTypeSchema,
} from "@riverly/ty";
import { serverInstallTable, serverTable } from "./server";
import { organizations } from "./users";

const { createInsertSchema, createSelectSchema } = createSchemaFactory({
  zodInstance: z,
});

const { createUpdateSchema } = createSchemaFactory({
  zodInstance: z,
});

export const buildTable = pgTable("build", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => genId()),
  serverId: varchar("server_id", { length: 255 })
    .references(() => serverTable.id)
    .notNull(),
  organizationId: text("organization_id")
    .references(() => organizations.id)
    .notNull(),
  // build trigger type
  triggerType: varchar("trigger_type", { length: 64 }).$type<TriggerType>().notNull(),
  // image artifact registry repo path
  // the path of image stored in our registry
  imageRef: varchar("image_ref", { length: 511 }),
  // unique hash generated after the image is successfully built
  imageDigest: varchar("image_digest", { length: 511 }),
  // direct sources
  artifact: varchar("artifact", { length: 511 }),
  // GitHub
  gitHubRepo: varchar("github_repo", { length: 511 }),
  githubOwner: varchar("github_owner", { length: 255 }),
  gitHubRef: varchar("github_ref", { length: 255 }),
  commitHash: varchar("commit_hash", { length: 511 }),
  // current status of the build, follows the deployment
  status: varchar("status", { length: 64 }).$type<DeploymentStatusType>().notNull(),
  // config snapshot
  configRevision: varchar("config_revision", { length: 128 }).notNull(), // from server config `revision` at t-time
  envs: jsonb("envs").$type<EnvsType>().notNull().default([]),
  config: jsonb("config").$type<ServerConfigType>().notNull().default({}),
  configHash: varchar("config_hash", { length: 511 }).notNull(),
  rootDir: varchar("root_dir", { length: 255 }).default("./").notNull(),
  //
  builtAt: timestamp("built_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const InsertBuild = createInsertSchema(buildTable, {
  serverId: z.string(),
  organizationId: z.string(),
  triggerType: triggerTypeSchema,
  imageRef: z.string().optional(),
  imageDigest: z.string().optional(),
  artifact: z.string().optional(),
  gitHubRepo: z.string().optional(),
  githubOwner: z.string().optional(),
  gitHubRef: z.string().optional(),
  commitHash: z.string().optional(),
  status: DeploymentStatus,
  //
  // server config snapshot
  // appended when build is initiated at `t` time.
  configRevision: z.string(),
  envs: EnvsSchema.optional(),
  config: ServerConfigSchema.optional(),
  rootDir: z.string().default("./"),
});

export const UpdateBuild = createUpdateSchema(buildTable, {
  imageRef: z.string().optional(),
  imageDigest: z.string().optional(),
  builtAt: z.coerce.date().optional(),
  status: DeploymentStatus,
}).pick({
  imageRef: true,
  imageDigest: true,
  builtAt: true,
  status: true,
});

export const GitHubInsertBuild = InsertBuild.pick({
  serverId: true,
  organizationId: true,
  gitHubRepo: true,
  githubOwner: true,
  gitHubRef: true,
  commitHash: true,
  configRevision: true,
  configHash: true,
  triggerType: true,
})
  .required()
  .extend({
    status: z.literal(DeploymentStatusEnum.PLACED),
    envs: EnvsSchema.optional(),
    config: ServerConfigSchema.optional(),
    rootDir: z.string().default("./"),
  });

export const deploymentTable = pgTable("deployment", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .notNull()
    .$defaultFn(() => genId()),
  buildId: varchar("build_id", { length: 255 })
    .references(() => buildTable.id)
    .notNull(),
  serverId: varchar("server_id", { length: 255 })
    .references(() => serverTable.id)
    .notNull(),
  organizationId: text("organization_id")
    .references(() => organizations.id)
    .notNull(),
  installId: varchar("install_id", { length: 255 })
    .references(() => serverInstallTable.id)
    .notNull(),
  status: varchar("status", { length: 64 }).$type<DeploymentStatusType>().notNull(),
  target: varchar("target", { length: 64 }).$type<DeploymentTargetType>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const InsertDeployment = createInsertSchema(deploymentTable, {
  buildId: z.string(),
  serverId: z.string(),
  organizationId: z.string(),
  installId: z.string(),
  status: DeploymentStatus,
  target: deploymentTargetSchema,
});

export const UpdateDeployment = createUpdateSchema(deploymentTable, {
  status: DeploymentStatus,
}).pick({
  status: true,
});

export const UpdateBuildDeploy = z.object({
  build: UpdateBuild,
  deployment: UpdateDeployment,
});

export const revisionTable = pgTable(
  "revision",
  {
    id: varchar("revision_id", { length: 255 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => genId()),
    buildId: varchar("build_id", { length: 255 })
      .references(() => buildTable.id)
      .notNull(),
    deploymentId: varchar("deployment_id", { length: 255 })
      .references(() => deploymentTable.id)
      .notNull(),
    serverId: varchar("server_id", { length: 255 })
      .references(() => serverTable.id)
      .notNull(),
    organizationId: text("organization_id")
      .references(() => organizations.id)
      .notNull(),
    version: varchar("version", { length: 128 }),
    current: boolean("current").notNull().default(false),
    status: varchar("status", { length: 64 })
      .$type<RevisionStatus>()
      .notNull()
      .default(RevisionStatusValue.DRAFT),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    unique("server_revision_server_id_version_key").on(table.serverId, table.version)
  ],
);

export type RevisionTable = typeof revisionTable.$inferSelect;

export const InsertRevision = createInsertSchema(revisionTable, {
  organizationId: z.string(),
  buildId: z.string(),
  deploymentId: z.string(),
  serverId: z.string(),
  status: RevisionStatusSchema,
});

export const publishRevisionSchema = InsertRevision.pick({
  id: true,
}).extend({
  status: z.literal(RevisionStatusValue.PUBLISHED),
});

export const deploymentLogTable = pgTable("deployment_log", {
  logId: varchar("log_id", { length: 64 })
    .primaryKey()
    .notNull()
    .$defaultFn(() => ulid().toLocaleLowerCase()),
  organizationId: text("organization_id")
    .references(() => organizations.id)
    .notNull(),
  deploymentId: varchar("deployment_id", { length: 255 })
    .references(() => deploymentTable.id)
    .notNull(),
  timestamp: timestamp("timestamp", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  message: text("message"),
  level: varchar("level", { length: 128 }).notNull().default("info"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const InsertDeploymentLog = createInsertSchema(deploymentLogTable, {
  organizationId: z.string(),
  deploymentId: z.string(),
  timestamp: z.coerce.date(),
  message: z.string().default(""),
  level: z.string(),
});

export const SelectDeployment = createSelectSchema(deploymentLogTable);

