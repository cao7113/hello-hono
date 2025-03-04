// try rpc in https://hono.dev/docs/concepts/stacks

import { Hono } from "hono";
import { logger } from "hono/logger";

import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const app = new Hono();
app.use(logger());

// http://localhost:8787/test
// http://localhost:8787/test?name=stack
const testRoute = app.get(
  "/test",
  zValidator(
    "query",
    z.object({
      name: z.string(),
    })
  ),
  (c) => {
    const { name } = c.req.valid("query");
    return c.json({ msg: `Hello ${name}` });
  }
);

// import in client side
export type AppType = typeof testRoute;

export default app;
