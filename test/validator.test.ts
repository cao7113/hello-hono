// https://hono.dev/docs/guides/validation

import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

import { describe, expect, test } from "vitest";

const app = new Hono().post(
  "/testing",
  zValidator(
    "json",
    z.object({
      title: z.string(),
    })
  ),
  (c) => {
    const body = c.req.valid("json");
    return c.json(body);
  }
);

describe("Validator", () => {
  test("POST /testing", async () => {
    const resp = await app.request("/testing", {
      method: "POST",
      body: JSON.stringify({ title: "Hello" }),
      // DONOT forget this line
      headers: new Headers({ "Content-Type": "application/json" }),
    });
    expect(resp.status).toBe(200);
    expect(await resp.json()).toEqual({ title: "Hello" });
  });
});
