import type { InferResponseType } from "hono/client";
import type { ClientType } from "./index";

export type UserType = InferResponseType<
	ClientType["api"]["v1"]["users"]["me"]["$get"],
	200
>;
