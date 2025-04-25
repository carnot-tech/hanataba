import { OpenAPIHono } from "@hono/zod-openapi";
import type { AuthVariables } from "@/app/api/[[...route]]/middleware/auth";
import _create from "./create";
import _list from "./list";
import _delete from "./delete";

const app = new OpenAPIHono<{ Variables: AuthVariables }>()
	.openapi(_create.route, _create.handler)
	.openapi(_list.route, _list.handler)
	.openapi(_delete.route, _delete.handler);

export default app;
