// https://hono.dev/docs/concepts/stacks#client
// https://hono.dev/docs/guides/rpc#using-rpc-with-larger-applications

import app from "./rpc";
import { hc } from "hono/client";
import type { InferRequestType, InferResponseType } from "hono/client";

const url = "http://localhost:3000";
const client = hc<typeof app>(url);
const res = await client.test.$get({
  query: {
    name: "Hono client",
  },
});

const data = await res.json();
console.log(`${data.msg}`);

const testUrl = client.test.$url();
// URL object
// URL {
//   href: "http://localhost:3000/test",
//   origin: "http://localhost:3000",
//   protocol: "http:",
//   username: "",
//   password: "",
//   host: "localhost:3000",
//   hostname: "localhost",
//   port: "3000",
//   pathname: "/test",
//   hash: "",
//   search: "",
//   searchParams: URLSearchParams {},
//   toJSON: [Function: toJSON],
//   toString: [Function: toString],
// }
console.log(testUrl);

// InferRequestType
const $testGet = client.test.$get;
type ReqType = InferRequestType<typeof $testGet>;

// InferResponseType
type ResType = InferResponseType<typeof $testGet>;
