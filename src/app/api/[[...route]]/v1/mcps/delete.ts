import { createRoute, z, type RouteHandler } from "@hono/zod-openapi";
import { db } from "@/db/drizzle";
import { mcpServersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { AuthVariables } from "@/app/api/[[...route]]/middleware/auth";
import { McpPolicy } from "@/domain/policy/mcp";
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
      description: "Deleted MCP server",
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

  if (!await McpPolicy().canDelete(user.id, id)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const project = await db.query.mcpServersTable.findFirst({
    where: (mcpServersTable, { eq }) => eq(mcpServersTable.id, id),
  });
  if (!project) {
    return c.json({ error: "MCP server not found" }, 404);
  }
  await db.delete(mcpServersTable).where(eq(mcpServersTable.id, id));

  return c.json({ message: "Project deleted successfully" }, 200);
};

export default { route, handler }; 