import { createRoute, z, type RouteHandler } from "@hono/zod-openapi";
import { db } from "@/db/drizzle";
import { mcpServerSelectSchema, mcpServersTable, mcpServerUpdateSchema } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { AuthVariables } from "@/app/api/[[...route]]/middleware/auth";
import { McpPolicy } from "@/domain/policy/mcp";
const inputSchema = mcpServerUpdateSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const outputSchema = mcpServerSelectSchema;

const route = createRoute({
  method: "put",
  path: "/:id",
  request: {
    params: z.object({
      id: z.string(),
    }),
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
      description: "Updated project",
    },
  },
});

const handler: RouteHandler<typeof route, {
  Variables: AuthVariables
}> = async (c) => {
  const { id } = c.req.param();
  const raw = await c.req.json();
  const valid = inputSchema.parse(raw);

  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!await McpPolicy().canUpdate(user.id, id)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const mcpServer = await db.query.mcpServersTable.findFirst({
    where: eq(mcpServersTable.id, id),
  });
  if (!mcpServer) {
    return c.json({ error: "MCP server not found" }, 404);
  }

  const updatedMcpServer = await db
    .update(mcpServersTable)
    .set({
      ...valid,
      updatedAt: new Date(),
    })
    .where(eq(mcpServersTable.id, id))
    .returning();
  if (!updatedMcpServer) {
    return c.json({ error: "Failed to update MCP server" }, 500);
  }

  return c.json(outputSchema.parse(updatedMcpServer[0]), 200);
};

export default { route, handler }; 