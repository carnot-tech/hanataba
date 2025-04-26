import { experimental_createMCPClient as createMCPClient } from "ai";
import { Experimental_StdioMCPTransport as StdioMCPTransport } from "ai/mcp-stdio"

export type SSEMCPServer = {
  type: 'sse';
  name: string;
  description: string;
  url: string;
  headers?: Record<string, string>;
}

export type StdioMCPServer = {
  type: 'stdio';
  name: string;
  description: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export type MCPServer = SSEMCPServer | StdioMCPServer;

export const getTools = async (mcp: MCPServer) => {
  switch (mcp.type) {
    case "stdio": {
      const client = await createMCPClient({
        transport: new StdioMCPTransport({
          command: mcp.command,
          args: mcp.args,
          env: mcp.env,
        }),
      });
      const tools = await client.tools()
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
      const tools = await client.tools()
      return tools;
    }
  }
};


