import { OpenAPIHono } from "@hono/zod-openapi";
import users from "./users";
import mcps from "./mcps";

const app = new OpenAPIHono()
	.route("/users", users)
	.route("/mcps", mcps);

export default app;
