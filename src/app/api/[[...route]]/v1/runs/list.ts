import { createRoute, type RouteHandler } from "@hono/zod-openapi";
import { db } from "@/db/drizzle";
import type { AuthVariables } from "@/app/api/[[...route]]/middleware/auth";
import { mcpRunSelectSchema, mcpRunsTable, mcpServersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { WorkspacePolicy } from "@/domain/policy/workspace";

const outputSchema = mcpRunSelectSchema.array();

const route = createRoute({
	method: "get",
	path: "/",
	request: {
		query: z.object({
			workspaceId: z.string(),
			mcpId: z.string().optional(),
			limit: z.number().optional().default(10),
			offset: z.number().optional().default(0),
		}),
	},
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

const handler: RouteHandler<
	typeof route,
	{
		Variables: AuthVariables;
	}
> = async (c) => {
	const { workspaceId, mcpId, limit, offset } = c.req.query();
	if (!workspaceId) {
		return c.json({ error: "Workspace ID is required" }, 400);
	}

	const user = c.get("user");
	if (!user) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	if (!(await WorkspacePolicy().canGet(user.id, workspaceId))) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const mcps = await db.query.mcpRunsTable.findMany({
		// where: eq(mcpRunsTable.mcpId, mcpId),
		limit: Number(limit),
		offset: Number(offset),
		with: {
			mcp: {
				where: eq(mcpServersTable.workspaceId, workspaceId),
			},
		},
	});
	return c.json(mcps, 200);
};

export default { route, handler };
