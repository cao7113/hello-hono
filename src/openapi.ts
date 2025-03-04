// Play OpenAPI
// https://github.com/honojs/middleware/blob/main/packages/zod-openapi/README.md
// https://github.com/honojs/middleware/blob/main/packages/swagger-ui/README.md

import { prettyJSON } from "hono/pretty-json";
import { cache } from "hono/cache";
import { bearerAuth } from "hono/bearer-auth";
import { basicAuth } from "hono/basic-auth";
import { jwt, sign } from "hono/jwt";
import type { JwtVariables } from "hono/jwt";
// import { hc } from "hono/client";

// NOTE: The z object should be imported from @hono/zod-openapi other than from hono
import { z, createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
// import { swaggerEditor } from "@hono/swagger-editor";

// Specify the variable types to infer the `c.get('jwtPayload')`:
type Variables = JwtVariables;

// an extended Hono class that supports OpenAPI.
const app = new OpenAPIHono<{ Variables: Variables }>();
// const app = new OpenAPIHono({
//   defaultHook: (result, c) => {
//     if (!result.success) {
//       return c.json(
//         {
//           ok: false,
//           errors: formatZodErrorIssues(result.error),
//           source: "custom_error_handler",
//         },
//         422
//       );
//     }
//   },
// });

app.use("/*", prettyJSON());

// https://github.com/honojs/middleware/tree/main/packages/zod-openapi#how-to-setup-authorization
// https://swagger.io/docs/specification/v3_0/authentication/bearer-authentication/
// https://spec.openapis.org/oas/latest.html#security-scheme-object-0

app.openAPIRegistry.registerComponent("securitySchemes", "JWT", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
  type: "http",
  scheme: "bearer",
});
app.openAPIRegistry.registerComponent("securitySchemes", "Basic", {
  type: "http",
  scheme: "basic",
});

// JUST for demo use!
const testUser = { name: "test", password: "test" };
const jwtSecret = "test-jwt-secret";

function formatZodErrorIssues(error: z.ZodError) {
  return error.issues.reduce((acc, err) => {
    const field = err.path.join(".");
    acc[field] = err.message;
    return acc;
  }, {} as Record<string, string>);
}

const UserSchema = z
  .object({
    id: z.string().openapi({
      example: "1",
    }),
    name: z.string().openapi({
      example: "test",
    }),
    age: z.number().int().openapi({
      example: 66,
    }),
  })
  // below register openapi component
  .openapi("User");

const ErrorSchema = z
  .object({
    code: z.number().openapi({
      example: 400,
    }),
    message: z.any(),
    // message: z.string().openapi({
    //   example: "Bad Request",
    // }),
  })
  .openapi("Error");

const userGet = app.openapi(
  createRoute({
    method: "get",
    path: "/users/{id}",
    tags: ["Users"],
    summary: "Get a user by ID",
    request: {
      params: z.object({
        id: z
          .string()
          .min(2)
          .openapi({
            param: {
              name: "id",
              in: "path",
            },
            example: "123",
          }),
      }),
    },
    middleware: [prettyJSON(), cache({ cacheName: "my-cache" })] as const, // Use `as const` to ensure TypeScript infers the middleware's Context.
    responses: {
      200: {
        content: {
          "application/json": {
            schema: UserSchema,
          },
        },
        description: "Retrieve the user",
      },
      400: {
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
        description: "Returns an error",
      },
    },
  }),
  (c) => {
    const { id } = c.req.valid("param");

    return c.json(
      {
        id,
        age: 20,
        name: "Ultra-man",
      },
      200 // You should specify the status code even if it is 200.
    );
  },
  // Hook
  (result, c) => {
    if (!result.success) {
      console.log(JSON.stringify(result, null, 2));
      return c.json(
        {
          code: 400,
          message: formatZodErrorIssues(result.error),
          // todo how to format pretty
          // message: `Validation Error ${formatZodErrorIssues(result.error)}`,
          // mesaage: result.error,
        },
        400
      );
    }
  }
);

const userLogin = app.openapi(
  createRoute({
    method: "post",
    path: "/login",
    tags: ["Users"],
    summary: "User login and gen jwt token",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              username: z.string().openapi({ example: "test" }),
              password: z.string().openapi({ example: "test" }),
            }),
          },
        },
        required: true,
      },
    },
    middleware: [prettyJSON()] as const, // Use `as const` to ensure TypeScript infers the middleware's Context.
    responses: {
      200: {
        description: "Retrieve the user",
        schema: z.object({
          username: z.string(),
          jwtToken: z.string(),
        }),
      },
      400: {
        content: {
          "application/json": {
            schema: ErrorSchema,
          },
        },
        description: "Returns an error",
      },
    },
  }),
  async (c) => {
    const { username, password } = c.req.valid("json");

    // just for demo
    if (username === testUser.name && password === testUser.password) {
      const timestamp: number = Date.now();
      const exp = timestamp + 1 * 60 * 60;
      // 定义 payload，可添加其他信息，比如 iat、exp 等
      const payload = { username, exp };
      // 使用 Hono 自带的 sign 函数生成 token，设置有效期 1 小时
      const token = await sign(payload, jwtSecret);
      return c.json(
        {
          username,
          jwtToken: token,
        },
        200
      );
    } else {
      return c.json(
        {
          code: 400,
          message: "Invalid credentials",
        },
        401
      );
    }
  }
);

const HeadersSchema = z.object({
  // Header keys must be in lowercase, `Authorization` is not allowed.
  authorization: z
    .string()
    .describe(
      "NOTE: set on top Authorize, NOT HERE!!! Get JWT token from login response"
    )
    .optional()
    .openapi({
      example: "Bearer xxx-JWT-SECRET",
    }),
});

const userInfo = app.openapi(
  createRoute({
    method: "get",
    path: "/profile",
    tags: ["Users"],
    summary: "Get user info by jwt token",
    request: {
      headers: HeadersSchema,
    },
    responses: {
      200: {
        description: "Success message",
      },
    },
    security: [
      {
        JWT: [],
      },
    ],
    middleware: jwt({
      secret: jwtSecret,
    }),
  }),

  (c) => {
    const payload = c.get("jwtPayload");
    return c.json({ ...payload, msg: "jwt authed" }); // eg: { "sub": "1234567890", "name": "John Doe", "iat": 1516239022 }
  }
);

const bookPost = app.openapi(
  createRoute({
    method: "post",
    path: "/books",
    tags: ["Books"],
    summary: "Create a Book",
    request: {
      body: {
        content: {
          // note this line!
          "application/json": {
            schema: z.object({
              title: z.string().openapi({ example: "test title" }),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Success message",
      },
    },
  }),
  (c) => {
    const { title } = c.req.valid("json");
    return c.json({ title: title });
  }
);

// https://hono.dev/docs/middleware/builtin/bearer-auth
// curl -X 'GET' 'http://localhost:8787/auth' -H 'Authorization: Bearer test-token'
const authDemo = app.openapi(
  createRoute({
    method: "get",
    path: "/auth/bearer",
    tags: ["Auth"],
    summary: "Test bearer auth",
    request: {},
    responses: {
      200: {
        description: "Success message",
      },
    },
    security: [
      {
        Bearer: [],
      },
    ],
    middleware: bearerAuth({ token: "bearer-token" }),
  }),

  (c) => {
    return c.json({ msg: `bearer authed` });
  }
);
const basicAuthDemo = app.openapi(
  createRoute({
    method: "get",
    path: "/auth/basic",
    tags: ["Auth"],
    summary: "Test basic auth",
    request: {},
    responses: {
      200: {
        description: "Success message",
      },
    },
    security: [
      {
        Basic: [],
      },
    ],
    middleware: basicAuth({ username: "test", password: "password" }),
  }),

  (c) => {
    return c.json({ msg: `basic authed` });
  }
);

const hiddenFromDocs = app.openapi(
  createRoute({
    method: "get",
    path: "/hidden",
    hide: true,
    request: {},
    responses: {
      200: {
        description: "Success message",
      },
    },
  }),
  (c) => {
    return c.json({ msg: `not show in SwaggerUI Docs` });
  }
);

const pingTest = app.openapi(
  createRoute({
    tags: ["Tools"],
    summary: "Ping Pong test",
    method: "get",
    path: "/ping",
    request: {},
    responses: {
      200: {
        description: "Success message",
      },
    },
  }),
  (c) => {
    return c.json({ msg: "Pong" });
  }
);

// https://editor.swagger.io/
app.doc31("/openapi", (c) => ({
  openapi: "3.1.0",
  info: {
    title: "OpenAPI Docs by SwaggerUI",
    version: "1",
    description: "OpenAPI Lab, add more description here...",
  },
  servers: [
    {
      url: new URL(c.req.url).origin,
      description: "Current environment",
    },
  ],
}));

app.get("/", swaggerUI({ url: "/openapi", title: "API Docs" }));

// RPC client support
// const client = hc<typeof userGet>("http://localhost:8787/");

// Swagger Editor support only for 3.0.x ? check at https://editor.swagger.io/
// app.get("/edit", swaggerEditor({ url: "/openapi" }));

export default app;
