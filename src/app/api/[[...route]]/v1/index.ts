import { OpenAPIHono } from "@hono/zod-openapi";
import users from "./users";

const app = new OpenAPIHono()
	.route("/users", users);

export default app;
