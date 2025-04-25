import { createRoute, type RouteHandler } from "@hono/zod-openapi";
import { db } from "@/db/drizzle";
import type { AuthVariables } from "@/app/api/[[...route]]/middleware/auth";
import { mcpServerSelectSchema } from "@/db/schema";

const outputSchema = mcpServerSelectSchema.array();

const route = createRoute({
	method: "get",
	path: "/",
	responses: {
		401: {
			description: "Unauthorized",
		},
		200: {
			content: {
				"application/json": {
					schema: outputSchema,
				},
			},
			description: "List of MCP servers",
		},
	},
});

const handler: RouteHandler<typeof route, {
  Variables: AuthVariables
}> = async (c) => {
	const mcps = await db.query.mcpServersTable.findMany({
    limit: 10
  });
  return c.json(mcps, 200);
};

export default { route, handler };
