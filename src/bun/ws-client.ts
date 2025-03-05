import { hc } from "hono/client";
import type { WebSocketApp } from "./ws";

const client = hc<WebSocketApp>("http://localhost:3000");
const ws = client.ws.$ws(0);

ws.addEventListener("open", () => {
  console.log(`Open connection to: ${ws.url}`);
  setInterval(() => {
    ws.send(new Date().toString());
  }, 2000);
});

ws.addEventListener("message", (event) => {
  console.log(`Message from server: ${event.data}`);
});

ws.addEventListener("close", () => {
  console.log("Recieved server connection closed!");
});

ws.addEventListener("error", (event) => {
  console.error(event);
});
