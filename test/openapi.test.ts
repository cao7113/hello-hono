// https://hono.dev/docs/guides/testing
// https://hono.dev/docs/helpers/testing

import app from "../src/openapi";
import { describe, expect, test } from "vitest";

describe("Tools", () => {
  test("GET /ping", async () => {
    const resp = await app.request("/ping");
    expect(resp.status).toBe(200);
    expect(await resp.json()).toEqual({ msg: "Pong" });
  });
});
