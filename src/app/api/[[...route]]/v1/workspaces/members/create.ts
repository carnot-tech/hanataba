import { createRoute, z, type RouteHandler } from "@hono/zod-openapi";
import { db } from "@/db/drizzle";
import { membershipsTable, membershipSelectSchema, membershipInsertSchema, workspacesTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { AuthVariables } from "@/app/api/[[...route]]/middleware/auth";
import { WorkspacePolicy } from "@/domain/policy/workspace";
const inputSchema = membershipInsertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  workspaceId: true,
});
const outputSchema = membershipSelectSchema;

const route = createRoute({
  method: "post",
  path: "/",
  request: {
    params: z.object({
      workspaceId: z.string(),
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
    404: {
      description: "Workspace not found",
    },
    200: {
      content: {
        "application/json": {
          schema: outputSchema,
        },
      },
      description: "Added member to workspace",
    },
  },
});

const handler: RouteHandler<typeof route, { Variables: AuthVariables }> = async (c) => {
  const workspaceId = c.req.param("workspaceId");
  if (!workspaceId) {
    return c.json({ error: "Workspace ID is required" }, 400);
  }

  const raw = await c.req.json();
  const valid = inputSchema.parse(raw);

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

  if (!await WorkspacePolicy().canUpdate(user.id, workspaceId)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const existingMembership = await db.query.membershipsTable.findFirst({
    where: and(
      eq(membershipsTable.workspaceId, workspaceId),
      eq(membershipsTable.userId, valid.userId)
    ),
  });
  if (existingMembership) {
    return c.json({ error: "User is already a member of this workspace" }, 400);
  }

  const membership = await db.insert(membershipsTable).values({
    id: crypto.randomUUID(),
    workspaceId,
    userId: valid.userId,
    role: valid.role,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();
  if (!membership) {
    return c.json({ error: "Failed to add member to workspace" }, 500);
  }

  return c.json(outputSchema.parse(membership[0]), 200);
};

export default { route, handler }; 