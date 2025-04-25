import { createRoute, z, type RouteHandler } from "@hono/zod-openapi";
import { db } from "@/db/drizzle";
import { workspacesTable, workspaceSelectSchema, workspaceUpdateSchema } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { AuthVariables } from "@/app/api/[[...route]]/middleware/auth";

const inputSchema = workspaceUpdateSchema;
const outputSchema = workspaceSelectSchema;

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
      description: "Updated workspace",
    },
  },
});

const handler: RouteHandler<typeof route, { Variables: AuthVariables }> = async (c) => {
  const { id } = c.req.param();
  const raw = await c.req.json();
  const valid = inputSchema.parse(raw);

  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const workspace = await db
    .update(workspacesTable)
    .set({
      name: valid.name,
      updatedAt: new Date(),
    })
    .where(eq(workspacesTable.id, id))
    .returning();
  if (!workspace) {
    return c.json({ error: "Failed to update workspace" }, 500);
  }

  return c.json(outputSchema.parse(workspace[0]), 200);
};

export default { route, handler }; 