"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { client } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const router = useRouter();
  const [newWorkspace, setNewWorkspace] = useState({
    name: "",
  });
  const isValid = newWorkspace.name.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValid) return;

    const response = await client.api.v1.workspaces.$post({
      json: {
        name: newWorkspace.name,
      },
    });

    if (response.ok) {
      router.push("/workspaces");
    }
  };

  return (
    <>
      <div className="flex justify-center mb-12">
        <h1 className="text-[28px] font-semibold leading-none">Workspaceを作成</h1>
      </div>

      <div className="mx-auto max-w-[480px]">
        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="space-y-2.5">
            <label htmlFor="workspace-name" className="text-sm font-medium leading-none">
              Workspace名
            </label>
            <Input 
              id="workspace-name" 
              placeholder="Workspace名を入力" 
              className="h-11"
              value={newWorkspace.name}
              onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-11"
            disabled={!isValid}
          >
            Workspaceを作成
          </Button>
        </form>
      </div>
    </>
  );
} 