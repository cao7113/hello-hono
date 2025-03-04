// https://hono.dev/docs/guides/testing
// https://hono.dev/docs/helpers/testing
// https://github.com/honojs/examples/tree/main/blog
// https://developers.cloudflare.com/workers/testing/
// https://developers.cloudflare.com/workers/testing/vitest-integration/get-started/write-your-first-test/

import { Hono } from "hono";
import app from "../src/index";
import { postApp } from "../src/index";
import { describe, expect, test } from "vitest";
import { testClient } from "hono/testing";

describe("Basic", () => {
  test("Get /", async () => {
    const resp = await app.request("/");
    expect(resp.status).toBe(302);
  });

  test("GET /api", async () => {
    const resp = await app.request("/api", {});
    expect(resp.status).toBe(200);
    expect(await resp.json()).toEqual({
      ok: true,
      msg: "Json API!",
    });
  });

  test("GET /ping", async () => {
    const resp = await app.request("/ping");
    expect(resp.status).toBe(200);
    expect(await resp.json()).toEqual({ msg: "Pong" });
  });
});

// https://hono.dev/docs/helpers/testing
// test client helper with hint
describe("Testing Helper", () => {
  test("try", async () => {
    const app = new Hono().get("/search", (c) => c.json({ hello: "world" }));
    const res = await testClient(app).search.$get();
    expect(await res.json()).toEqual({ hello: "world" });
  });

  test("test on imported postApp", async () => {
    const res = await testClient(postApp).ping.$get();
    expect(await res.text()).toEqual("Pong");
  });

  // NOTE: ping should chain on the app!!!
  test("test on imported app", async () => {
    const res = await testClient(app).ping.$get();
    expect(await res.json()).toEqual({ msg: "Pong" });
  });

  // test("test on imported app plain", async () => {
  //   const res = await testClient(app).plain.$get();
  //   expect(await res.text()).toEqual("Reply plain text");
  // });
});

describe("Posts", () => {
  test("GET /posts/1", async () => {
    const resp = await app.request("/posts/1");
    expect(resp.status).toBe(200);
    expect(resp.headers.get("X-Message")).toBe("Hi!");
    expect(await resp.text()).toBe("post id=1");
  });

  test("POST /posts", async () => {
    const resp = await app.request("/posts", { method: "POST" });
    expect(resp.status).toBe(201);
    expect(await resp.text()).toBe("Created!");
  });

  test("POST /posts with body", async () => {
    const res = await app.request("/posts", {
      method: "POST",
      body: JSON.stringify({ message: "hello hono" }),
      headers: new Headers({ "Content-Type": "application/json" }),
    });
    expect(res.status).toBe(201);
    // expect(res.headers.get("X-Custom")).toBe("Thank you");
    expect(await res.text()).toEqual("Created!");
  });

  test("POST /posts with form-data", async () => {
    const formData = new FormData();
    formData.append("message", "hello");
    const res = await app.request("/posts", {
      method: "POST",
      body: formData,
    });
    expect(res.status).toBe(201);
    // expect(res.headers.get("X-Custom")).toBe("Thank you");
    expect(await res.text()).toEqual("Created!");
  });

  test("DELETE /posts/1", async () => {
    const resp = await app.request("/posts/1", { method: "DELETE" });
    expect(resp.status).toBe(200);
    expect(await resp.text()).toBe("Post id=1 is deleted!");
  });
});
