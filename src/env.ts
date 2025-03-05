import { Hono } from "hono";
import { env, getRuntimeKey } from "hono/adapter";

export const app = new Hono().get("/", (c) => {
  // NAME is process.env.NAME on Node.js or Bun
  // NAME is the value written in `wrangler.toml` on Cloudflare

  const { TEST_ENV } = env<{ TEST_ENV: string }>(c);
  const runtime = getRuntimeKey();
  return c.json({ TEST_ENV, runtime });
});

export default app;
