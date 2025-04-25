import { createRoute, z, type RouteHandler } from "@hono/zod-openapi";
import { db } from "@/db/drizzle";
import {
	membershipsTable,
	workspacesTable,
	workspaceSelectSchema,
} from "@/db/schema";
import { eq, getTableColumns } from "drizzle-orm";
import type { AuthVariables } from "@/app/api/[[...route]]/middleware/auth";

const outputSchema = z.array(workspaceSelectSchema);

const route = createRoute({
	method: "get",
	path: "/",
	responses: {
		401: {
			description: "Unauthorized",
		},
		200: {
			description: "Workspaces list",
			content: {
				"application/json": {
					schema: outputSchema,
				},
			},
		},
	},
});

const handler: RouteHandler<typeof route, { Variables: AuthVariables }> = async (c) => {
	const user = c.get("user");
	if (!user) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const result = await db
		.select({
			...getTableColumns(workspacesTable),
    })
		.from(workspacesTable)
		.innerJoin(membershipsTable, eq(workspacesTable.id, membershipsTable.workspaceId))
		.where(eq(membershipsTable.userId, user.id));

	return c.json(result.map((item) => workspaceSelectSchema.parse(item)));
};

export default { route, handler };
