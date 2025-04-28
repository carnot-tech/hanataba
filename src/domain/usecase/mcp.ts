import { experimental_createMCPClient as createMCPClient } from "ai";
import { Experimental_StdioMCPTransport as StdioMCPTransport } from "ai/mcp-stdio";

export type SSEMCPServer = {
	type: "sse";
	name: string;
	description: string;
	url: string;
	headers?: Record<string, string>;
};

export type StdioMCPServer = {
	type: "stdio";
	name: string;
	description: string;
	command: string;
	args: string[];
	env?: Record<string, string>;
};

export type MCPServer = SSEMCPServer | StdioMCPServer;

export const getTools = async (mcp: MCPServer) => {
	switch (mcp.type) {
		case "stdio": {
			const env = mcp.env ?? {};
			if (process.env.IS_VERCEL_FLUID === "development") {
				env.npm_config_cache = "/tmp/.npm-cache";
				env.npm_config_prefix = "/tmp/.npm-global";
				env.npm_config_tmp = "/tmp";
			}
			const client = await createMCPClient({
				transport: new StdioMCPTransport({
					command: mcp.command,
					args: mcp.args,
					env,
				}),
			});
			const tools = await client.tools();
			return tools;
		}
		case "sse": {
			const client = await createMCPClient({
				transport: {
					type: "sse",
					url: mcp.url,
					headers: mcp.headers,
				},
			});
			const tools = await client.tools();
			return tools;
		}
	}
};
