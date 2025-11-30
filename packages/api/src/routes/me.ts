import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";

import { User } from "@riverly/riverly";

import { verifyBetterAuthToken } from "../middlewares/middlewares";

const app = new Hono();

app.get("/", bearerAuth({ verifyToken: verifyBetterAuthToken }), async (c) => {
  const sessionUser = c.get("user");
  const user = await User.fromIDWithDefualtOrg(sessionUser.userId);
  return c.json({ ...user });
});

export default app;
