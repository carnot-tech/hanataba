import { OpenAPIHono } from "@hono/zod-openapi";
import type { AuthVariables } from "@/app/api/[[...route]]/middleware/auth";
import _me from "./get-me";

const app = new OpenAPIHono<{
	Variables: AuthVariables;
}>()
	.openapi(_me.route, _me.handler);

export default app;
