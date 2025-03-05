// import { hc } from "hono/client";
// import type app from "./ws-server";

// const client = hc<typeof app>("http://localhost:8787");
// const ws = client.ws.$ws(0);

// ws.addEventListener("open", () => {
//   setInterval(() => {
//     ws.send(new Date().toString());
//   }, 1000);
// });

import { hc } from "hono/client";
import app from "./ws";

const client = hc<typeof app>("http://localhost:8787");
const ws = client.ws.$ws(0);

ws.addEventListener("open", () => {
  setInterval(() => {
    ws.send(new Date().toString());
  }, 1000);
});
