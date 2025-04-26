import { OpenAPIHono } from "@hono/zod-openapi";
import users from "./users";
import mcps from "./mcps";
import workspaces from "./workspaces";
import runs from "./runs";
const app = new OpenAPIHono()
	.route("/users", users)
	.route("/mcps", mcps)
	.route("/runs", runs)
	.route("/workspaces", workspaces)

export default app;
