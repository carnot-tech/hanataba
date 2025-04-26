import { createRoute, type RouteHandler } from "@hono/zod-openapi";
import { db } from "@/db/drizzle";
import {
	mcpServerSelectSchema,
	mcpServerInsertSchema,
  mcpServersTable,
} from "@/db/schema";
import type { AuthVariables } from "@/app/api/[[...route]]/middleware/auth";
import { WorkspacePolicy } from "@/domain/policy/workspace";

const inputSchema = mcpServerInsertSchema.omit({
	id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});
const outputSchema = mcpServerSelectSchema;

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
			description: "Created mcp server",
		},
	},
});

const handler: RouteHandler<typeof route, {
  Variables: AuthVariables
}> = async (c) => {
	const raw = await c.req.json();
	const valid = inputSchema.parse(raw);

  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!await WorkspacePolicy().canUpdate(user.id, valid.workspaceId)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

	const project = await db.insert(mcpServersTable).values({
    ...valid,
		id: crypto.randomUUID(),
    userId: user.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();
	return c.json(outputSchema.parse(project[0]), 200);
};

export default { route, handler };
