import { createRoute, type RouteHandler } from "@hono/zod-openapi";
import { userSelectSchema } from "@/db/schema";
import type { AuthVariables } from "@/app/api/[[...route]]/middleware/auth";

const outputSchema = userSelectSchema;

const route = createRoute({
	method: "get",
	path: "/me",
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
			description: "Current user details",
		},
	},
});

const handler: RouteHandler<typeof route, {
	Variables: AuthVariables;
}> = async (c) => {
	const user = c.get("user");
	if (!user) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	return c.json(outputSchema.parse(user), 200);
};

export default { route, handler };
