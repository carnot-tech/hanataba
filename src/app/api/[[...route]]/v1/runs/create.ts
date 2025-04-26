import { createRoute, z, type RouteHandler } from "@hono/zod-openapi";
import type { AuthVariables } from "@/app/api/[[...route]]/middleware/auth";
import { mcpRunsTable, mcpServersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db/drizzle";
import { getTools } from "@/domain/usecase/mcp";
import { mcpRunSelectSchema } from "@/db/schema";

const inputSchema = z.object({
  toolId: z.string(),
  parameters: z.record(z.string(), z.any()),
});
const outputSchema = mcpRunSelectSchema;

const route = createRoute({
  method: "post",
  path: "/",
  request: {
    query: z.object({
      mcpId: z.string(),
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
    200: {
      content: {
        "application/json": {
          schema: outputSchema,
        },
      },
      description: "Execute an action",
    },
    500: {
      description: "Internal server error",
    },
  },
});

const handler: RouteHandler<
  typeof route,
  {
    Variables: AuthVariables
  }
> = async (c) => {
  const mcpId = c.req.query("mcpId");
  if (!mcpId) {
    return c.json({ error: "MCP ID is required" }, 400);
  }

  const raw = await c.req.json();
	const valid = inputSchema.parse(raw);

  const mcp = await db.query.mcpServersTable.findFirst({
    where: eq(mcpServersTable.id, mcpId),
    with: {
      workspace: true,
    },
  });
  if (!mcp) {
    return c.json({ error: "MCP not found" }, 404);
  }

  const user = c.get("user");
  if (!user) {
    const authHeader = c.req.header("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return c.json({ error: "Invalid authorization header" }, 401);
    }

    const accessToken = authHeader.slice(7);
    if (accessToken !== mcp.workspace.accessToken) {
      return c.json({ error: "Invalid access token" }, 401);
    }
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
  const tool = tools[valid.toolId];
  if (!tool) {
    return c.json({ error: "Tool not found" }, 404);
  }

  const run = await db.insert(mcpRunsTable).values({
    id: crypto.randomUUID(),
    mcpId,
    toolId: valid.toolId,
    parameters: valid.parameters,
    status: "running",
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();
  // FIXME: use real options
  const result = await tool.execute(valid.parameters, {
    toolCallId: "123",
    messages: [],
  });
  const updatedRun = await db.update(mcpRunsTable).set({
    status: "success",
    result: result,
    updatedAt: new Date(),
  }).where(eq(mcpRunsTable.id, run[0].id)).returning();

  return c.json(updatedRun[0], 200);
};

export default {
  route,
  handler,
};