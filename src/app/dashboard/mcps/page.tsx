"use client";

import { useWorkspace } from "@/hooks/use-workspace";
import { client } from "@/lib/api-client";
import { useEffect, useState } from "react";
import type { MCPServerInsertType, MCPServersType } from "@/lib/api-client/types";
import { MCPServerManager } from "@/components/mcp-server-manager";
import { Button } from "@/components/ui/button";
import { PlusCircle, Globe, Terminal } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const { activeWorkspace } = useWorkspace();
  const [mcps, setMcps] = useState<MCPServersType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!activeWorkspace?.id) return;
    const fetchMcps = async () => {
      const response = await client.api.v1.mcps.$get({
        query: {
          workspaceId: activeWorkspace.id,
        },
      });
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      setMcps(data);
    };
    fetchMcps();
  }, [activeWorkspace]);

  const handleSubmit = async (server: MCPServerInsertType) => {
    if (!activeWorkspace?.id) return;
    const response = await client.api.v1.mcps.$post({
      json: {
        ...server,
        workspaceId: activeWorkspace.id,
      },
    });
    if (!response.ok) {
      return;
    }
    const data = await response.json();
    setMcps([...mcps, data]);
    setIsModalOpen(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">MCPs</h1>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2" variant="ghost">
          <PlusCircle className="h-4 w-4" />
          Add MCP
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mcps.map((mcp) => (
          <Card 
            key={mcp.id} 
            className="border rounded-lg bg-background hover:bg-muted/40 transition-colors cursor-pointer"
            onClick={() => router.push(`/dashboard/mcps/${mcp.id}`)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium text-foreground">{mcp.name}</CardTitle>
                <Badge variant={mcp.type === "sse" ? "default" : "secondary"} className="bg-muted/50 border-none text-foreground">
                  {mcp.type === "sse" ? (
                    <Globe className="h-3 w-3 mr-1" />
                  ) : (
                    <Terminal className="h-3 w-3 mr-1" />
                  )}
                  {mcp.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {mcp.type === "sse" && mcp.url && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <span className="truncate">{mcp.url}</span>
                </div>
              )}
              {mcp.type === "stdio" && mcp.command && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Terminal className="h-4 w-4" />
                  <span className="truncate">{mcp.command}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <MCPServerManager
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
