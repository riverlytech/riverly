import "dotenv/config";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";

import type { SessionUser } from "@riverly/ty";

import { verifyBetterAuthToken, type MembershipCtx } from "./middlewares/middlewares";
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

app.use(async (c, next) => {
  const start = Date.now();
  await next();
  const end = Date.now();
  c.res.headers.set("X-Response-Time", `${end - start}`);
});

app.get("/", (c) => {
  return c.text("Ok");
});

app.get("/v1/user", bearerAuth({ verifyToken: verifyBetterAuthToken }), async (c) => {
  const sessionUser = c.get("user");
  // modify this route for fetching authenticated user,
  // perhaps to a DB call to fetch more details.
  return c.json(sessionUser);
});

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

Bun.serve({
  fetch: app.fetch,
  port,
  hostname: "0.0.0.0",
  idleTimeout: 120,
});

console.info(`API listening on http://0.0.0.0:${port}`);
