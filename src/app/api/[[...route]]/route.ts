import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import { OpenAPIHono } from "@hono/zod-openapi";
import { auth } from "@/lib/auth";


const app = new OpenAPIHono()
	.basePath("/api")
	.use("*", cors())
  .on(["POST", "GET"], "/auth/**", (c) => auth.handler(c.req.raw))
  .get("/healthz", (c) => {
    return c.json({
      status: "ok",
    });
  })

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);

export type AppType = typeof app;
