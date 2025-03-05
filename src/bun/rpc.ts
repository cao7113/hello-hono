// https://hono.dev/docs/concepts/stacks

import { Hono } from "hono";
import { logger } from "hono/logger";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

export const app = new Hono().use(logger()).get(
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

export default app;
