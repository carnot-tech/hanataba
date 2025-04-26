"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, Terminal, Trash2, Wrench, Play, Loader2 } from "lucide-react";
import type { MCPServersType, MCPToolType } from "@/lib/api-client/types";
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

type ExecutionResult = {
  output: string;
  error?: string;
};

export default function MCPServerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [server, setServer] = useState<MCPServersType | null>(null);
  const [tools, setTools] = useState<MCPToolType[]>([]);
  const [selectedTool, setSelectedTool] = useState<MCPToolType | null>(null);
  const [isExecuteModalOpen, setIsExecuteModalOpen] = useState(false);
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

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
      const response = await client.api.v1.mcps[":mcpId"].tools.$get({
        param: {
          mcpId: params.id as string,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTools(data);
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
    
    // バリデーション
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

  if (!server) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{server.name}</h1>
          <p className="text-muted-foreground">{server.description}</p>
        </div>
        <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={handleDelete}>
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Server
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border rounded-lg bg-background">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Badge variant={server.type === "sse" ? "default" : "secondary"} className="bg-muted/50 border-none">
                {server.type === "sse" ? (
                  <Globe className="w-4 h-4 mr-1" />
                ) : (
                  <Terminal className="w-4 h-4 mr-1" />
                )}
                {server.type.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {server.type === "sse" ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">URL</h3>
                  <p className="text-sm text-muted-foreground">{server.url}</p>
                </div>
                <div>
                  <h3 className="font-medium">Headers</h3>
                  <pre className="text-sm bg-muted/40 p-2 overflow-x-auto max-h-[200px] overflow-y-auto whitespace-pre-wrap break-all">
                    {typeof server.headers === 'string' ? server.headers : JSON.stringify(server.headers, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Command</h3>
                  <p className="text-sm text-muted-foreground">{server.command}</p>
                </div>
                <div>
                  <h3 className="font-medium">Arguments</h3>
                  <pre className="text-sm bg-muted/40 p-2 overflow-x-auto max-h-[200px] overflow-y-auto whitespace-pre-wrap break-all">
                    {typeof server.args === 'string' ? server.args : JSON.stringify(server.args, null, 2)}
                  </pre>
                </div>
                <div>
                  <h3 className="font-medium">Environment Variables</h3>
                  <pre className="text-sm bg-muted/40 p-2 overflow-x-auto max-h-[200px] overflow-y-auto whitespace-pre-wrap break-all">
                    {typeof server.env === 'string' ? server.env : JSON.stringify(server.env, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border rounded-lg bg-background">
          <CardHeader className="pb-2">
            <CardTitle>Server Information</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Server ID</h3>
                <p className="text-sm text-muted-foreground">{server.id}</p>
              </div>
              <div>
                <h3 className="font-medium">Created At</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(server.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="font-medium">Last Updated</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(server.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border rounded-lg bg-background">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Available Tools
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {tools.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tools available</p>
            ) : (
              tools.map((tool) => (
                <div key={tool.id} className="bg-muted/40 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{tool.id}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="ml-4"
                      onClick={() => {
                        setSelectedTool(tool);
                        setParameters({});
                        setIsExecuteModalOpen(true);
                      }}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Execute
                    </Button>
                  </div>
                  {Object.keys(tool.parameters).length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Parameters:</h4>
                      <pre className="text-sm bg-muted/40 p-2 mt-1 overflow-x-auto max-h-[200px] overflow-y-auto whitespace-pre-wrap break-all">
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

      <Dialog open={isExecuteModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="border rounded-lg bg-background">
          <DialogHeader>
            <DialogTitle>Execute Tool: {selectedTool?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">{selectedTool?.description}</p>
            
            {!executionResult && !executionError && (
              <div className="space-y-4">
                {selectedTool && (
                  <div className="space-y-4">
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
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Executing...</span>
              </div>
            )}

            {executionError && (
              <div className="bg-destructive/10 p-4 rounded-lg">
                <p className="text-destructive">{executionError}</p>
              </div>
            )}

            {executionResult && (
              <div className="space-y-2">
                <h4 className="font-medium">Execution Result:</h4>
                <pre className="bg-muted/40 p-4 rounded-lg overflow-x-auto max-h-[200px] overflow-y-auto whitespace-pre-wrap break-all">
                  {JSON.stringify(executionResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
          <DialogFooter>
            {executionResult || executionError ? (
              <Button variant="ghost" onClick={handleCloseModal}>
                Close
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button 
                  variant="ghost"
                  onClick={handleExecute} 
                  disabled={isExecuting}
                >
                  {isExecuting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Execute
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
