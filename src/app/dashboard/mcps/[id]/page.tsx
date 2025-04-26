"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, Terminal, Trash2, Wrench, Play, Loader2, Pencil, ChevronDown } from "lucide-react";
import type { MCPServersType, MCPServerUpdateType, MCPToolType } from "@/lib/api-client/types";
import { client } from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MCPServerManager } from "@/components/mcp-server-manager";
import { cn } from "@/lib/utils";
import type { MCPRunResultType } from "@/lib/api-client/types";

type JsonSchemaProperty = {
  type: string;
  description?: string;
};

type JsonSchema = {
  type: string;
  properties: Record<string, JsonSchemaProperty>;
  required?: string[];
  additionalProperties: boolean;
};

type ToolParameter = {
  jsonSchema: JsonSchema;
};

export default function MCPServerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [server, setServer] = useState<MCPServersType | null>(null);
  const [tools, setTools] = useState<MCPToolType[]>([]);
  const [isLoadingTools, setIsLoadingTools] = useState(false);
  const [selectedTool, setSelectedTool] = useState<MCPToolType | null>(null);
  const [isExecuteModalOpen, setIsExecuteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<MCPRunResultType | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [showEnvVars, setShowEnvVars] = useState(false);

  useEffect(() => {
    const fetchServer = async () => {
      const response = await client.api.v1.mcps[":id"].$get({
        param: {
          id: params.id as string,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setServer(data);
      }
    };
    fetchServer();
  }, [params.id]);

  useEffect(() => {
    const fetchTools = async () => {
      setIsLoadingTools(true);
      try {
        const response = await client.api.v1.mcps[":mcpId"].tools.$get({
          param: {
            mcpId: params.id as string,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setTools(data);
        }
      } finally {
        setIsLoadingTools(false);
      }
    };
    fetchTools();
  }, [params.id]);

  const handleDelete = async () => {
    const response = await client.api.v1.mcps[":id"].$delete({
      param: {
        id: params.id as string,
      },
    });
    if (response.ok) {
      router.push("/dashboard/mcps");
    }
  };

  const handleToolExecute = async (toolId: string, parameters: Record<string, string>) => {
    const response = await client.api.v1.runs.$post({
      query: {
        mcpId: params.id as string,
      },
      json: {
        toolId,
        parameters,
      },
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    throw new Error('Failed to execute tool');
  };

  const renderParameterInput = (
    name: string,
    schema: JsonSchemaProperty,
    required: boolean
  ) => {
    const isRequired = required;
    
    return (
      <div key={name} className="space-y-2">
        <Label htmlFor={name} className="flex items-center gap-1">
          {name}
          {isRequired && <span className="text-red-500">*</span>}
        </Label>
        {schema.description && (
          <p className="text-sm text-gray-500">{schema.description}</p>
        )}
        <Input
          id={name}
          value={parameters[name] || ''}
          onChange={(e) => setParameters(prev => ({ ...prev, [name]: e.target.value }))}
          placeholder={`Enter ${name}`}
          required={isRequired}
        />
      </div>
    );
  };

  const handleExecute = async () => {
    if (!selectedTool) return;
    
    // Validation
    const schema = (selectedTool.parameters as ToolParameter).jsonSchema;
    const requiredFields = schema.required || [];
    const missingFields = requiredFields.filter(field => !parameters[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return;
    }

    setIsExecuting(true);
    setExecutionResult(null);
    setExecutionError(null);

    try {
      const result = await handleToolExecute(selectedTool.id, parameters);
      setExecutionResult(result);
    } catch (error) {
      console.error('Failed to execute tool:', error);
      setExecutionError(error instanceof Error ? error.message : 'Failed to execute tool');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCloseModal = () => {
    setIsExecuteModalOpen(false);
    setParameters({});
    setExecutionResult(null);
    setExecutionError(null);
  };

  const handleEdit = async (updatedServer: MCPServerUpdateType) => {
    const response = await client.api.v1.mcps[":id"].$put({
      param: {
        id: params.id as string,
      },
      json: updatedServer,
    });
    
    if (response.ok) {
      const data = await response.json();
      setServer(data);
      setIsEditModalOpen(false);
    }
  };

  if (!server) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b">
        <div>
          <h1 className="text-lg font-medium">{server.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {server.description}
          </p>
        </div>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditModalOpen(true)}
            className="h-8 px-2"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/5" 
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Server Configuration Card */}
        <Card className="border rounded-sm bg-background">
          <CardHeader className="pb-1.5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Configuration</CardTitle>
              <Badge 
                variant="outline" 
                className={cn(
                  "border-none text-sm h-6",
                  server.type === "sse" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                )}
              >
                {server.type === "sse" ? (
                  <Globe className="h-3 w-3 mr-1" />
                ) : (
                  <Terminal className="h-3 w-3 mr-1" />
                )}
                {server.type.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-1.5 pt-0">
            {server.type === "sse" ? (
              <div className="space-y-1.5">
                <div className="bg-muted/5 p-1.5 rounded-sm">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-0.5">
                    <Globe className="h-3 w-3 flex-shrink-0" />
                    <span>URL</span>
                  </div>
                  <p className="text-sm font-mono break-all">{server.url}</p>
                </div>
                <div className="bg-muted/5 p-1.5 rounded-sm">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-0.5">
                    <span>Headers</span>
                  </div>
                  <pre className="text-sm font-mono overflow-x-auto max-h-[200px] overflow-y-auto whitespace-pre-wrap break-all">
                    {typeof server.headers === 'string' ? server.headers : JSON.stringify(server.headers, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="bg-muted/5 p-1.5 rounded-sm">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-0.5">
                    <Terminal className="h-3 w-3 flex-shrink-0" />
                    <span>Command</span>
                  </div>
                  <p className="text-sm font-mono break-all">{server.command}</p>
                </div>
                <div className="bg-muted/5 p-1.5 rounded-sm">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-0.5">
                    <span>Arguments</span>
                  </div>
                  <pre className="text-sm font-mono overflow-x-auto max-h-[200px] overflow-y-auto whitespace-pre-wrap break-all">
                    {typeof server.args === 'string' ? server.args : JSON.stringify(server.args, null, 2)}
                  </pre>
                </div>
                <div className="bg-muted/5 p-1.5 rounded-sm">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <span>Environment Variables</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowEnvVars(!showEnvVars)}
                      className="h-7 text-sm text-muted-foreground hover:text-foreground px-1"
                    >
                      <ChevronDown className={`w-3 h-3 transition-transform ${showEnvVars ? 'rotate-180' : ''}`} />
                    </Button>
                  </div>
                  {showEnvVars && (
                    <pre className="text-sm font-mono overflow-x-auto max-h-[200px] overflow-y-auto whitespace-pre-wrap break-all">
                      {typeof server.env === 'string' ? server.env : JSON.stringify(server.env, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Server Information Card */}
        <Card className="border rounded-sm bg-background">
          <CardHeader className="pb-1.5">
            <CardTitle className="text-sm font-medium">Server Information</CardTitle>
          </CardHeader>
          <CardContent className="p-1.5 pt-0">
            <div className="space-y-1.5">
              <div className="bg-muted/5 p-1.5 rounded-sm">
                <div className="text-sm text-muted-foreground mb-0.5">Server ID</div>
                <p className="text-sm font-mono">{server.id}</p>
              </div>
              <div className="bg-muted/5 p-1.5 rounded-sm">
                <div className="text-sm text-muted-foreground mb-0.5">Created At</div>
                <p className="text-sm">
                  {new Date(server.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="bg-muted/5 p-1.5 rounded-sm">
                <div className="text-sm text-muted-foreground mb-0.5">Last Updated</div>
                <p className="text-sm">
                  {new Date(server.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tools Section */}
      <div className="mt-2">
        <Card className="border rounded-sm bg-background">
          <CardHeader className="pb-1.5">
            <div className="flex items-center gap-1">
              <Wrench className="w-4 h-4" />
              <CardTitle className="text-sm font-medium">Available Tools</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-1.5 pt-0">
            <div className="space-y-1.5">
              {isLoadingTools ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-1.5 text-sm text-muted-foreground">Loading tools...</span>
                </div>
              ) : tools.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tools available</p>
              ) : (
                tools.map((tool) => (
                  <div key={tool.id} className="bg-muted/5 p-1.5 rounded-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium">{tool.id}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">{tool.description}</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="h-7 px-1.5"
                        onClick={() => {
                          setSelectedTool(tool);
                          setParameters({});
                          setIsExecuteModalOpen(true);
                        }}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                    {Object.keys(tool.parameters).length > 0 && (
                      <div className="mt-1.5">
                        <div className="text-sm text-muted-foreground mb-0.5">Parameters:</div>
                        <pre className="text-sm font-mono bg-muted/10 p-1 rounded-sm overflow-x-auto max-h-[200px] overflow-y-auto whitespace-pre-wrap break-all">
                          {JSON.stringify(tool.parameters, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Execute Tool Dialog */}
      <Dialog open={isExecuteModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="border rounded-sm bg-background">
          <DialogHeader>
            <DialogTitle className="text-sm font-medium">Execute Tool: {selectedTool?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <p className="text-sm text-muted-foreground">{selectedTool?.description}</p>
            
            {!executionResult && !executionError && (
              <div className="space-y-2">
                {selectedTool && (
                  <div className="space-y-2">
                    {Object.entries((selectedTool.parameters as ToolParameter).jsonSchema.properties).map(
                      ([name, property]) => renderParameterInput(
                        name,
                        property,
                        (selectedTool.parameters as ToolParameter).jsonSchema.required?.includes(name) || false
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {isExecuting && (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-1.5 text-sm text-muted-foreground">Executing...</span>
              </div>
            )}

            {executionError && (
              <div className="bg-destructive/5 p-1.5 rounded-sm">
                <p className="text-sm text-destructive">{executionError}</p>
              </div>
            )}

            {executionResult && (
              <div className="space-y-1.5">
                <div className="text-sm text-muted-foreground">Execution Result:</div>
                <pre className="text-sm font-mono bg-muted/5 p-1.5 rounded-sm overflow-x-auto max-h-[200px] overflow-y-auto whitespace-pre-wrap break-all">
                  {JSON.stringify(executionResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
          <DialogFooter>
            {executionResult || executionError ? (
              <Button variant="ghost" size="sm" onClick={handleCloseModal}>
                Close
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={handleExecute} 
                  disabled={isExecuting}
                >
                  {isExecuting && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
                  Execute
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MCPServerManager
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEdit}
        mode="edit"
        initialData={server}
      />
    </div>
  );
}
