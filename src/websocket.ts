import { Hono } from "hono";
import { logger } from "hono/logger";
import { upgradeWebSocket } from "hono/cloudflare-workers";

const app = new Hono();
app.use(logger());

app.get("/ping", (c) => {
  return c.json({ msg: "Pong" });
});

// More ref https://developers.cloudflare.com/workers/examples/websockets/
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Protocol_upgrade_mechanism
// https://hono.dev/docs/getting-started/basic#adapter
// There are Adapters for platform-dependent functions, e.g., handling static files or WebSocket. For example, to handle WebSocket in Cloudflare Workers, import hono/cloudflare-workers.
app.get(
  "/ws",
  upgradeWebSocket((c) => {
    console.log("WebSocket connection established!");
    const [client, server] = Object.values(new WebSocketPair());
    server.accept();

    server.addEventListener("message", (event) => {
      console.log("Received message:", event.data);
      server.send(`Echo: ${event.data}`);
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  })
);

// Export final app
export default app;
