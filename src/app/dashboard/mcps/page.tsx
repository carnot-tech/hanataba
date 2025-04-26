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
import { cn } from "@/lib/utils";

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
    <div>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <div>
          <h1 className="text-lg font-medium">MCPs</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your MCP servers
          </p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="gap-1.5 h-8" 
          variant="outline"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Add MCP
        </Button>
      </div>

      {/* Content Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {mcps.map((mcp) => (
          <Card 
            key={mcp.id} 
            className={cn(
              "border rounded-sm bg-background hover:bg-muted/20 transition-colors cursor-pointer",
              "group"
            )}
            onClick={() => router.push(`/dashboard/mcps/${mcp.id}`)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium group-hover:text-primary transition-colors">
                  {mcp.name}
                </CardTitle>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "border-none text-xs h-5",
                    mcp.type === "sse" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                  )}
                >
                  {mcp.type === "sse" ? (
                    <Globe className="h-2.5 w-2.5 mr-1" />
                  ) : (
                    <Terminal className="h-2.5 w-2.5 mr-1" />
                  )}
                  {mcp.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-2 pt-0">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/5 p-1.5 rounded-sm">
                {mcp.type === "sse" ? (
                  <>
                    <Globe className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{mcp.url}</span>
                  </>
                ) : (
                  <>
                    <Terminal className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{mcp.command}</span>
                  </>
                )}
              </div>
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
