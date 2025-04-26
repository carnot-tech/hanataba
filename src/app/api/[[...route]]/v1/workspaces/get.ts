import { createRoute, z, type RouteHandler } from "@hono/zod-openapi";
import { db } from "@/db/drizzle";
import { workspacesTable, workspaceSelectSchema } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { AuthVariables } from "@/app/api/[[...route]]/middleware/auth";
import { WorkspacePolicy } from "@/domain/policy/workspace";

const outputSchema = workspaceSelectSchema;

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
      description: "Workspace not found",
    },
    200: {
      content: {
        "application/json": {
          schema: outputSchema,
        },
      },
      description: "Workspace details",
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

  if (!await WorkspacePolicy().canGet(user.id, id)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const workspace = await db.query.workspacesTable.findFirst({
    where: eq(workspacesTable.id, id),
  });
  if (!workspace) {
    return c.json({ error: "Workspace not found" }, 404);
  }

  return c.json(outputSchema.parse(workspace), 200);
};

export default { route, handler }; 