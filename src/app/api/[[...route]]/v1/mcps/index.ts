import { OpenAPIHono } from "@hono/zod-openapi";
import type { AuthVariables } from "@/app/api/[[...route]]/middleware/auth";
import _list from "./list";
import _create from "./create";
import _get from "./get";
import _delete from "./delete";
import _update from "./update";
import tools from "./tools";
import runs from "./runs";

const app = new OpenAPIHono<{ Variables: AuthVariables }>()
	.openapi(_list.route, _list.handler)
	.openapi(_create.route, _create.handler)
	.openapi(_get.route, _get.handler)
	.openapi(_delete.route, _delete.handler)
	.openapi(_update.route, _update.handler)
	.route("/:mcpId/tools", tools)
	.route("/:mcpId/runs", runs);

export default app;
