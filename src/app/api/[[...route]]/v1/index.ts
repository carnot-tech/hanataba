import { OpenAPIHono } from "@hono/zod-openapi";
import users from "./users";
import mcps from "./mcps";
import workspaces from "./workspaces";

const app = new OpenAPIHono()
	.route("/users", users)
	.route("/mcps", mcps)
	.route("/workspaces", workspaces)

export default app;
