import { OpenAPIHono } from "@hono/zod-openapi";
import type { AuthVariables } from "@/app/api/[[...route]]/middleware/auth";
import _create from "./create";
import _list from "./list";
import _get from "./get";

const app = new OpenAPIHono<{ Variables: AuthVariables }>()
	.openapi(_create.route, _create.handler)
	.openapi(_list.route, _list.handler)
	.openapi(_get.route, _get.handler);

export default app;
