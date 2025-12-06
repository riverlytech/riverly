import { Hono } from "hono";

import { authMiddleware } from "../middlewares/middlewares";

const app = new Hono();

app.get("/validate", authMiddleware, async (c) => {
  // Just respond with ok: true
  // This is to validate JWT token without fuss
  return c.json(
    {
      ok: true,
    },
    200,
  );
});

export default app;
