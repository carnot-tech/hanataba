import { createRoute, z, type RouteHandler } from "@hono/zod-openapi";
import { db } from "@/db/drizzle";
import { workspacesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { AuthVariables } from "@/app/api/[[...route]]/middleware/auth";
import { WorkspacePolicy } from "@/domain/policy/workspace";
const route = createRoute({
	method: "delete",
	path: "/:id",
	request: {
		params: z.object({
			id: z.string(),
		}),
	},
	responses: {
		401: {
			description: "Unauthorized",
		},
		200: {
			description: "Deleted workspace",
		},
	},
});

const handler: RouteHandler<typeof route, { Variables: AuthVariables }> = async (c) => {
	const id = c.req.param("id");
	if (!id) {
		return c.json({ error: "Workspace ID is required" }, 400);
	}

	const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

	if (!await WorkspacePolicy().canDelete(user.id, id)) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const workspace = await db
		.delete(workspacesTable)
		.where(eq(workspacesTable.id, id))
		.returning();
	if (!workspace) {
		return c.json({ error: "Failed to delete workspace" }, 500);
	}

	return c.json({ message: "Workspace deleted successfully" }, 200);
};

export default { route, handler };
