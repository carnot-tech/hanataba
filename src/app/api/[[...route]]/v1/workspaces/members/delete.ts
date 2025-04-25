import { createRoute, z, type RouteHandler } from "@hono/zod-openapi";
import { db } from "@/db/drizzle";
import { membershipsTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { AuthVariables } from "@/app/api/[[...route]]/middleware/auth";

const route = createRoute({
	method: "delete",
	path: "/:id",
	request: {
		query: z.object({
			id: z.string(),
		}),
	},
	responses: {
		401: {
			description: "Unauthorized",
		},
		404: {
			description: "Workspace not found or member not found",
		},
		200: {
			description: "Member removed from workspace",
		},
	},
});

const handler: RouteHandler<
	typeof route,
	{ Variables: AuthVariables }
> = async (c) => {
	const membershipId = c.req.param("id");

	const user = c.get("user");
	if (!user) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	const membership = await db.query.membershipsTable.findFirst({
		where: and(
			eq(membershipsTable.id, membershipId),
		),
	});
	if (!membership) {
		return c.json({ error: "Member not found in workspace" }, 404);
	}

	await db.delete(membershipsTable).where(eq(membershipsTable.id, membershipId));

	return c.json({ message: "Member removed from workspace" }, 200);
};

export default { route, handler };
