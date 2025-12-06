import { Hono } from "hono";

import { User } from "@riverly/riverly";

import { authMiddleware } from "../middlewares/middlewares";

const app = new Hono();

app.get("/", authMiddleware, async (c) => {
  const sessionUser = c.get("user");
  const user = await User.fromIDWithDefaultOrg(sessionUser.userId);
  return c.json({ ...user });
});

export default app;
