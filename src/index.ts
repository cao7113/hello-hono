import { Hono } from "hono";
import { logger } from "hono/logger";
import { etag } from "hono/etag";
import { prettyJSON } from "hono/pretty-json";
import { html } from "hono/html";

const app = new Hono().get("/ping", (c) => {
  return c.json({ msg: "Pong" });
});

app.use(etag(), logger());

app.get("/", (c) => {
  // return c.json({ msg: "Hello Hono!" });
  return c.redirect("/api?pretty");
});

app.use("/api/*", prettyJSON());

// curl http://localhost:8787/api?pretty
app.get("/api", (c) => {
  return c.json({
    ok: true,
    msg: "Json API!",
  });
});

// Posts
export const postApp = new Hono()
  .get("/ping", (c) => c.text("Pong"))
  .get("/:id", (c) => {
    const id = c.req.param("id");
    c.header("X-Message", "Hi!");
    return c.text(`post id=${id}`);
  })
  .post("/", (c) => c.text("Created!", 201))
  .delete("/:id", (c) => c.text(`Post id=${c.req.param("id")} is deleted!`));

app.route("/posts", postApp);

// Formats

app.get("/plain", (c) => {
  return c.text("Reply plain text");
});

app.get("/raw", () => {
  // Content-Type: text/plain;charset=UTF-8
  return new Response("raw Response!");
});

app.get("/html", (c) => {
  return c.html(
    html`<body style="color: blue">
      Hello html
    </body>`
  );
});

app.get("/vendor/cf-works", (c) => c.text("Hello Cloudflare Workers!"));

// Export final app
export default app;
// for cf workers
// export default {
//   fetch: app.fetch,
//   scheduled: async (batch, env) => {},
// }
