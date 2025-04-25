import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import { OpenAPIHono } from "@hono/zod-openapi";
import { auth } from "@/lib/auth";
import _v1 from "./v1";
import { authMiddleware, type AuthVariables } from "./middleware/auth";

const app = new OpenAPIHono<{
	Variables: AuthVariables;
}>()
	.basePath("/api")
	.use("*", cors())
	.use("*", authMiddleware)
	.on(["POST", "GET"], "/auth/**", (c) => auth.handler(c.req.raw))
	.get("/healthz", (c) => {
		return c.json({
			status: "ok",
		});
	})
	.route("/v1", _v1);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);

export type AppType = typeof app;
