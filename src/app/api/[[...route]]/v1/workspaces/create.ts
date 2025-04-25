import { createRoute, type RouteHandler } from "@hono/zod-openapi";
import { db } from "@/db/drizzle";
import {
	workspacesTable,
	workspaceSelectSchema,
	workspaceInsertSchema,
  membershipsTable,
} from "@/db/schema";
import type { AuthVariables } from "@/app/api/[[...route]]/middleware/auth";

const inputSchema = workspaceInsertSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});
const outputSchema = workspaceSelectSchema;

const route = createRoute({
	method: "post",
	path: "/",
	request: {
		body: {
			content: {
				"application/json": {
					schema: inputSchema,
				},
			},
		},
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
			description: "Created workspace",
		},
	},
});

const handler: RouteHandler<typeof route, { Variables: AuthVariables }> = async (c) => {
	const raw = await c.req.json();
	const valid = inputSchema.parse(raw);

	const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

	const workspace = await db
		.insert(workspacesTable)
		.values({
			id: crypto.randomUUID(),
			name: valid.name,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.returning();
	if (!workspace) {
		return c.json({ error: "Failed to create workspace" }, 500);
	}

	await db.insert(membershipsTable).values({
		id: crypto.randomUUID(),
		userId: user.id,
		workspaceId: workspace[0].id,
		role: "owner",
		createdAt: new Date(),
		updatedAt: new Date(),
	});

	return c.json(outputSchema.parse(workspace[0]), 200);
};

export default { route, handler };
