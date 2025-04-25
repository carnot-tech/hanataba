import { OpenAPIHono } from "@hono/zod-openapi";
import type { AuthVariables } from "@/app/api/[[...route]]/middleware/auth";
import _create from "./create";

const app = new OpenAPIHono<{ Variables: AuthVariables }>().openapi(
	_create.route,
	_create.handler,
);

export default app;
