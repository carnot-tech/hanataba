import { createRoute, z, type RouteHandler } from "@hono/zod-openapi";
import { db } from "@/db/drizzle";
import { mcpServerSelectSchema, mcpServersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { AuthVariables } from "@/app/api/[[...route]]/middleware/auth";
import { McpPolicy } from "@/domain/policy/mcp";
const outputSchema = mcpServerSelectSchema;

const route = createRoute({
  method: "get",
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
    404: {
      description: "MCP server not found",
    },
    200: {
      content: {
        "application/json": {
          schema: outputSchema,
        },
      },
      description: "MCP server details",
    },
  },
});

const handler: RouteHandler<typeof route, {
  Variables: AuthVariables
}> = async (c) => {
  const id = c.req.param("id");
  if (!id) {
    return c.json({ error: "MCP server ID is required" }, 400);
  }

  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!await McpPolicy().canGet(user.id, id)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const project = await db.query.mcpServersTable.findFirst({
    where: eq(mcpServersTable.id, id),
  });
  if (!project) {
    return c.json({ error: "MCP server not found" }, 404);
  }

  return c.json(outputSchema.parse(project), 200);
};

export default { route, handler }; 