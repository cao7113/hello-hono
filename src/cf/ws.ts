import { Hono } from "hono";
import { upgradeWebSocket } from "hono/cloudflare-workers";

// https://developers.cloudflare.com/workers/examples/websockets/
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Protocol_upgrade_mechanism
// https://hono.dev/docs/getting-started/basic#adapter
// There are Adapters for platform-dependent functions, e.g., handling static files or WebSocket. For example, to handle WebSocket in Cloudflare Workers, import hono/cloudflare-workers.

const app = new Hono().get("/", (c) => {
  return c.json({ msg: "Pong" });
});
// .get(
//   "/ws",
//   upgradeWebSocket(() => {
//     return {
//       onMessage: (event) => {
//         console.log(event.data);
//       },
//     };
//   })
// );

// app.get(
//   "/ws",
//   upgradeWebSocket((c) => {
//     console.log("WebSocket connection established!");
//     const [client, server] = Object.values(new WebSocketPair());
//     server.accept();

//     server.addEventListener("message", (event) => {
//       console.log("Received message:", event.data);
//       server.send(`Echo: ${event.data}`);
//     });

//     return new Response(null, {
//       status: 101,
//       webSocket: client,
//     });
//   })
// );

export default app;
