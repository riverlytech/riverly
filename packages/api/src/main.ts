import "dotenv/config";
import { Hono } from "hono";

import type { SessionUser } from "@riverly/ty";

import { logger } from "./lib/logging";
import { type MembershipCtx } from "./middlewares/middlewares";
import authRoutes from "./routes/auth";
import deploymentRoutes from "./routes/deployments";
import meRoutes from "./routes/me";
import serverRoutes from "./routes/servers";
import v1internalRoutes from "./routes/v1internal";

declare module "hono" {
  interface ContextVariableMap {
    user: SessionUser;
    membership: MembershipCtx;
  }
}

const app = new Hono({ strict: false });

app.get("/", (c) => c.text("Ok"));

app.route("/v1/auth", authRoutes);
app.route("/v1/me", meRoutes);
app.route("/v1/servers", serverRoutes);
app.route("/v1/deployment", deploymentRoutes);
app.route("/__/v1", v1internalRoutes);

// export default {
//   port: 8080,
//   hostname: "0.0.0.0",
//   fetch: app.fetch,
//   listen: {
//     ipv6Only: false, // Allows both IPv6 and IPv4
//   },
// };

const port = Number(process.env.PORT ?? "5000");
const host = process.env.HOST ?? "0.0.0.0";

Bun.serve({
  fetch: app.fetch,
  port,
  hostname: host,
  idleTimeout: 120,
});

logger.info(`API listening on http://${host}:${port}`);
