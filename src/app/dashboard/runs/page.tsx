"use client";

import { useEffect, useState, useCallback } from "react";
import type { MCPRunType } from "@/lib/api-client/types";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { client } from "@/lib/api-client";
import { useWorkspace } from "@/hooks/use-workspace";
import { useRouter } from "next/navigation";
import { Table, TableHeader, TableBody, TableCell, TableRow, TableHead } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function useRuns() {
  const { activeWorkspace } = useWorkspace();
  const [runs, setRuns] = useState<MCPRunType[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRuns = useCallback(async () => {
    if (!activeWorkspace?.id) return;
    setLoading(true);
    const response = await client.api.v1.runs.$get({
      query: { workspaceId: activeWorkspace.id },
    });
    if (response.ok) {
      const data = await response.json();
      setRuns(data);
    }
    setLoading(false);
  }, [activeWorkspace]);

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  return { runs, loading, fetchRuns };
}

export default function Page() {
  const { runs, loading, fetchRuns } = useRuns();
  const router = useRouter();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium">Runs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            View and manage your runs
          </p>
        </div>
        <Button 
          onClick={fetchRuns} 
          disabled={loading} 
          variant="outline" 
          className="gap-1.5"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          Reload
        </Button>
      </div>
      <div className="border rounded-md bg-background">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-muted/20">
              <TableHead className="text-xs text-muted-foreground font-medium">ID</TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium">Tool</TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium">Status</TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium">Started At</TableHead>
              <TableHead className="text-xs text-muted-foreground font-medium">Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {runs.map((run, index) => (
              <TableRow 
                key={run.id} 
                className={cn(
                  "hover:bg-muted/20 cursor-pointer transition-colors",
                  index % 2 === 0 ? "bg-muted/5" : "bg-background"
                )}
                onClick={() => router.push(`/dashboard/runs/${run.id}`)}
              >
                <TableCell className="font-mono text-xs text-muted-foreground">{run.id}</TableCell>
                <TableCell className="text-sm font-medium">{run.toolId}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "border-none text-xs",
                      run.status === "success" && "bg-green-50 text-green-600",
                      run.status === "error" && "bg-red-50 text-red-600",
                      run.status === "running" && "bg-yellow-50 text-yellow-600"
                    )}
                  >
                    {run.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{formatDate(run.createdAt)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {run.createdAt && run.updatedAt
                    ? `${((new Date(run.updatedAt).getTime() - new Date(run.createdAt).getTime()) / 1000).toFixed(1)}s`
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function formatDate(date: string) {
  return new Date(date).toLocaleString(undefined, {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
