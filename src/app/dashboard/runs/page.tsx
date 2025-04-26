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
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">All Runs</h1>
        <Button onClick={fetchRuns} disabled={loading} variant="ghost" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Reload
        </Button>
      </div>
      <div className="border rounded-lg bg-background">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-muted/40">
              <TableHead className="text-muted-foreground font-medium">ID</TableHead>
              <TableHead className="text-muted-foreground font-medium">Tool</TableHead>
              <TableHead className="text-muted-foreground font-medium">Status</TableHead>
              <TableHead className="text-muted-foreground font-medium">Started At</TableHead>
              <TableHead className="text-muted-foreground font-medium">Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {runs.map((run) => (
              <TableRow 
                key={run.id} 
                className="hover:bg-muted/40 cursor-pointer"
                onClick={() => router.push(`/dashboard/runs/${run.id}`)}
              >
                <TableCell className="font-mono text-xs text-muted-foreground">{run.id}</TableCell>
                <TableCell className="text-foreground font-medium">{run.toolId}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`border-none ${
                      run.status === "success"
                        ? "bg-green-100 text-green-700"
                        : run.status === "error"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {run.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{formatDate(run.createdAt)}</TableCell>
                <TableCell className="text-muted-foreground">
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
