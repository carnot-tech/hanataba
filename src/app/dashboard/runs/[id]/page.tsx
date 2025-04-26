"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { MCPRunType } from "@/lib/api-client/types";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/api-client";

function formatDate(date: string) {
  return new Date(date).toLocaleString(undefined, {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RunDetailPage() {
  const params = useParams();
  const router = useRouter();
  const runId = params.id as string;
  const [run, setRun] = useState<MCPRunType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRun = async () => {
      setLoading(true);
      const response = await client.api.v1.runs[":id"].$get({
        param: {
          id: runId,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setRun(data);
      }
      setLoading(false);
    };
    fetchRun();
  }, [runId]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading...</div>;
  }
  if (!run) {
    return <div className="p-8 text-center text-red-500">Run not found</div>;
  }

  // メタデータの整形
  const meta = [
    {
      label: "RUN STATUS",
      value: (
        <span className={`inline-block px-2 py-0.5 rounded border text-xs font-semibold ${
          run.status === "success"
            ? "bg-green-100 text-green-700 border-green-200"
            : run.status === "error"
            ? "bg-red-100 text-red-700 border-red-200"
            : "bg-yellow-100 text-yellow-700 border-yellow-200"
        }`}>
          {run.status}
        </span>
      ),
    },
    {
      label: "STARTED AT",
      value: formatDate(run.createdAt),
    },
    {
      label: "DURATION",
      value: run.createdAt && run.updatedAt
        ? `${((new Date(run.updatedAt).getTime() - new Date(run.createdAt).getTime()) / 1000).toFixed(1)}s`
        : "-",
    },
    {
      label: "RUN ID",
      value: <span className="font-mono text-xs text-muted-foreground">{run.id}</span>,
    },
  ];

  // parameters/resultまとめて1つのJSONとして表示
  const combinedJson = {
    parameters: run.parameters,
    result: run.result,
    channel: run.channel,
    // 必要なら他のフィールドもここに追加
  };

  return (
    <div className="w-full mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Run Detail</h1>
        <Button variant="outline" onClick={() => router.push("/dashboard/runs")}>Back to Runs</Button>
      </div>
      {/* メタデータ部分: 横並び */}
      <div className="flex flex-wrap gap-4 mb-4">
        {meta.map((item) => (
          <div key={item.label} className="flex flex-col min-w-[120px] bg-muted/40 p-3 rounded-lg">
            <span className="text-xs text-muted-foreground font-medium mb-1 tracking-wide uppercase">{item.label}</span>
            <span className="text-base font-semibold break-all">{item.value}</span>
          </div>
        ))}
      </div>
      {/* 内容部分: タイトル＋大きなJSONボックス */}
      <div className="mb-2 font-semibold text-muted-foreground">At run on {formatDate(run.createdAt)}</div>
      <div className="bg-muted/40 border rounded-lg p-4 font-mono text-xs whitespace-pre-wrap break-all">
        {JSON.stringify(combinedJson, null, 2)}
      </div>
    </div>
  );
}
