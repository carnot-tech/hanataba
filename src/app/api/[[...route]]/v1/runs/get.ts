import { createRoute, z, type RouteHandler } from "@hono/zod-openapi";
import { db } from "@/db/drizzle";
import { mcpRunSelectSchema, mcpRunsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { AuthVariables } from "@/app/api/[[...route]]/middleware/auth";

const outputSchema = mcpRunSelectSchema;

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
      description: "MCP run not found",
    },
    200: {
      content: {
        "application/json": {
          schema: outputSchema,
        },
      },
      description: "MCP run details",
    },
  },
});

const handler: RouteHandler<typeof route, {
  Variables: AuthVariables
}> = async (c) => {
  const id = c.req.param("id");
  if (!id) {
    return c.json({ error: "MCP run ID is required" }, 400);
  }

  // const user = c.get("user");
  // if (!user) {
  //   return c.json({ error: "Unauthorized" }, 401);
  // }

  const project = await db.query.mcpRunsTable.findFirst({
    where: eq(mcpRunsTable.id, id),
  });
  if (!project) {
    return c.json({ error: "MCP run not found" }, 404);
  }

  return c.json(outputSchema.parse(project), 200);
};

export default { route, handler }; 