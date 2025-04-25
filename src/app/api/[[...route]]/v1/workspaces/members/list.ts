import { createRoute, z, type RouteHandler } from "@hono/zod-openapi";
import { db } from "@/db/drizzle";
import { membershipsTable, membershipSelectSchema, workspacesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { AuthVariables } from "@/app/api/[[...route]]/middleware/auth";

const outputSchema = z.array(membershipSelectSchema);

const route = createRoute({
  method: "get",
  path: "/",
	request: {
		params: z.object({
			workspaceId: z.string(),
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
      description: "List of workspace members",
    },
  },
});

const handler: RouteHandler<typeof route, { Variables: AuthVariables }> = async (c) => {
  const workspaceId = c.req.param("workspaceId");
  if (!workspaceId) {
    return c.json({ error: "Workspace ID is required" }, 400);
  }

  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const workspace = await db.query.workspacesTable.findFirst({
    where: eq(workspacesTable.id, workspaceId),
  });
  if (!workspace) {
    return c.json({ error: "Workspace not found" }, 404);
  }

  const members = await db.query.membershipsTable.findMany({
    where: eq(membershipsTable.workspaceId, workspaceId),
  });

  return c.json(outputSchema.parse(members), 200);
};

export default { route, handler }; 