import type { InferResponseType, InferRequestType } from "hono/client";
import type { ClientType } from "./index";

export type UserType = InferResponseType<
	ClientType["api"]["v1"]["users"]["me"]["$get"],
	200
>;

export type MCPServerInsertType = InferRequestType<
	ClientType["api"]["v1"]["mcps"]["$post"]
>["json"];

export type MCPServersType = InferResponseType<
	ClientType["api"]["v1"]["mcps"]["$get"],
	200
>[number];

export type WorkspaceType = InferResponseType<
	ClientType["api"]["v1"]["workspaces"]["$get"],
	200
>[number];

export type MCPToolType = InferResponseType<
	ClientType["api"]["v1"]["mcps"][":mcpId"]["tools"]["$get"],
	200
>[number];

export type MCPRunType = InferResponseType<
	ClientType["api"]["v1"]["runs"]["$post"],
	200
>;
