"use client";

import { useWorkspace } from "@/hooks/use-workspace";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function WorkspaceDetails() {
  const { activeWorkspace } = useWorkspace();
  const [showToken, setShowToken] = useState(false);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {activeWorkspace && (
          <>
            <div className="space-y-2">
              <Label>Workspace Name</Label>
              <div className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                {activeWorkspace.name}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Workspace ID</Label>
              <div className="flex items-center space-x-2">
                <div className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono">
                  {activeWorkspace.id}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(activeWorkspace.id);
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Access Token</Label>
              <div className="flex items-center space-x-2">
                <div className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono">
                  {showToken ? activeWorkspace.accessToken : "••••••••••••••••"}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(activeWorkspace.accessToken);
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}