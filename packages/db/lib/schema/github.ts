import {
  integer,
  pgTable,
  timestamp,
  unique,
  varchar,
  text,
} from "drizzle-orm/pg-core";
import { organizations } from "./users";

export type GitHubAccountType = "User" | "Organization";

export const gitHubInstallationTable = pgTable(
  "github_installation",
  {
    githubInstallationId: integer("github_installation_id").primaryKey(),
    githubAppId: integer("github_app_id").notNull(),
    accountId: integer("account_id").notNull(),
    // `account.login` - The account's username or organization name.
    accountLogin: varchar("account_login", { length: 255 }).notNull(),
    // `account.type` - 'User' or 'Organization'.
    accountType: varchar("account_type", { length: 64 })
      .$type<GitHubAccountType>()
      .notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    unique("github_installation_app_id_organization_id_account_login_key").on(
      table.githubAppId,
      table.organizationId,
      table.accountLogin
    ),
    unique("github_installation_app_id_organization_id_account_id").on(
      table.githubAppId,
      table.organizationId,
      table.accountId
    ),
  ]
);

export type GitHubInstallationTable =
  typeof gitHubInstallationTable.$inferSelect;
