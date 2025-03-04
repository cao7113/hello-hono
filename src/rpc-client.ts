// https://hono.dev/docs/concepts/stacks#client
// https://hono.dev/docs/guides/rpc#using-rpc-with-larger-applications

import { AppType } from "./rpc-server";
import { hc } from "hono/client";

const client = hc<AppType>("http://localhost:8787");
const res = await client["test"].$get({
  query: {
    name: "Hono",
  },
});

const data = await res.json();
console.log(`${data.msg}`);
