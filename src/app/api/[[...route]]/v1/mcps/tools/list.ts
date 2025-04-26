import { createRoute, z, type RouteHandler } from "@hono/zod-openapi";
import { db } from "@/db/drizzle";
import type { AuthVariables } from "@/app/api/[[...route]]/middleware/auth";
import { mcpServersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getTools } from "@/domain/usecase/mcp";
import { WorkspacePolicy } from "@/domain/policy/workspace";

const toolSchema = z.object({
  id: z.string(),
  description: z.string(),
  parameters: z.record(z.string(), z.any()),
});

const outputSchema = z.array(toolSchema);

const route = createRoute({
	method: "get",
	path: "/",
  request: {
		params: z.object({
			mcpId: z.string().describe("MCP ID"),
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

const handler: RouteHandler<typeof route, {
  Variables: AuthVariables
}> = async (c) => {
  const mcpId = c.req.param("mcpId");
  if (!mcpId) {
    return c.json({ error: "MCP ID is required" }, 400);
  }

  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const mcp = await db.query.mcpServersTable.findFirst({
    where: eq(mcpServersTable.id, mcpId),
  });
  if (!mcp) {
    return c.json({ error: "MCP not found" }, 404);
  }

  if (!await WorkspacePolicy().canGet(user.id, mcp.workspaceId)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const tools = await getTools(
    mcp.type === "sse"
      ? {
          type: "sse",
          name: mcp.name,
          description: mcp.description,
          url: mcp.url ?? "",
          headers: JSON.parse(mcp.headers as string),
        }
      : {
          type: "stdio",
          name: mcp.name,
          description: mcp.description,
          command: mcp.command ?? "",
          args: JSON.parse(mcp.args as string),
          env: mcp.env as Record<string, string>,
        }
  );
  return c.json(Object.entries(tools).map(([key, value]) => ({
    id: key,
    description: value.description,
    parameters: value.parameters,
  })), 200);
};

export default { route, handler };
