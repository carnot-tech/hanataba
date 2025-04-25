import { OpenAPIHono } from "@hono/zod-openapi";
import type { AuthVariables } from "@/app/api/[[...route]]/middleware/auth";
import _list from "./list";

const app = new OpenAPIHono<{ Variables: AuthVariables }>()
  .openapi(_list.route, _list.handler);

export default app;