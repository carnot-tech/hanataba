"use client";

import { useEffect, useState, useCallback } from "react";
import type { MCPRunType } from "@/lib/api-client/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";
import { client } from "@/lib/api-client";
import { useWorkspace } from "@/hooks/use-workspace";
import { useRouter } from "next/navigation";

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
    <div className="">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">All Runs</h1>
        <Button onClick={fetchRuns} disabled={loading} variant="outline" size="sm">
          <RotateCw className={loading ? "animate-spin mr-2 w-4 h-4" : "mr-2 w-4 h-4"} />
          Reload
        </Button>
      </div>
      <Card className="p-0 shadow-lg rounded-xl">
        <div className="w-full max-w-full overflow-x-auto">
          <table className="table-fixed w-full min-w-[900px] text-sm">
            <thead>
              <tr className="bg-muted/60 sticky top-0 z-10">
                <th className="px-4 py-3 text-left font-semibold w-[100px]">Status</th>
                <th className="px-4 py-3 text-left font-semibold w-[120px]">MCP</th>
                <th className="px-4 py-3 text-left font-semibold w-[120px]">Tool</th>
                <th className="px-4 py-3 text-left font-semibold w-[200px]">Parameters</th>
                <th className="px-4 py-3 text-left font-semibold w-[200px]">Result</th>
                <th className="px-4 py-3 text-left font-semibold w-[120px]">Created</th>
                <th className="px-4 py-3 text-left font-semibold w-[120px]">Updated</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr
                  key={run.id}
                  className="transition hover:shadow-md hover:bg-muted/30 rounded-xl cursor-pointer"
                  style={{ borderRadius: 12 }}
                  onClick={() => router.push(`/dashboard/runs/${run.id}`)}
                  tabIndex={0}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      router.push(`/dashboard/runs/${run.id}`);
                    }
                  }}
                >
                  <td className="px-4 py-2 align-top max-w-[100px] truncate">
                    <StatusBadge status={run.status} />
                  </td>
                  <td className="px-4 py-2 align-top max-w-[120px] truncate">{run.mcpId}</td>
                  <td className="px-4 py-2 align-top max-w-[120px] truncate">{run.toolId}</td>
                  <td className="px-4 py-2 align-top max-w-[200px] truncate">
                    <JsonPreview value={run.parameters} />
                  </td>
                  <td className="px-4 py-2 align-top max-w-[200px] truncate">
                    <JsonPreview value={run.result} />
                  </td>
                  <td className="px-4 py-2 align-top max-w-[120px] truncate">{formatDate(run.createdAt)}</td>
                  <td className="px-4 py-2 align-top max-w-[120px] truncate">{formatDate(run.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
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

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "success"
      ? "bg-green-100 text-green-700 border-green-200"
      : status === "error"
      ? "bg-red-100 text-red-700 border-red-200"
      : "bg-yellow-100 text-yellow-700 border-yellow-200";
  return (
    <span className={`inline-block px-2 py-0.5 rounded border text-xs font-semibold ${color}`}>
      {status}
    </span>
  );
}

function JsonPreview({ value }: { value: unknown }) {
  const [open, setOpen] = useState(false);
  const str = JSON.stringify(value, null, 2);
  const isLong = str.length > 80;
  return (
    <button
      type="button"
      className="bg-muted/40 rounded p-2 font-mono text-xs cursor-pointer transition hover:bg-muted/60 max-w-[200px] overflow-x-auto text-left"
      onClick={() => setOpen((v) => !v)}
      title={isLong ? (open ? "クリックで折りたたみ" : "クリックで展開") : undefined}
      style={{ minWidth: 80 }}
    >
      {isLong && !open ? `${str.slice(0, 80)}…` : str}
    </button>
  );
}
