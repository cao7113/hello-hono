// https://hono.dev/docs/concepts/stacks#with-react

// functions/api/[[route]].ts
import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const app = new Hono();

const schema = z.object({
  id: z.string(),
  title: z.string(),
});

type Todo = z.infer<typeof schema>;

const todos: Todo[] = [];

const route = app
  .post("/todo", zValidator("form", schema), (c) => {
    const todo = c.req.valid("form");
    todos.push(todo);
    return c.json({
      message: "created!",
    });
  })
  .get((c) => {
    return c.json({
      todos,
    });
  });

export type AppType = typeof route;

export const onRequest = handle(app, "/api");
