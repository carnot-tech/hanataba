"use client";

import { useWorkspace } from "@/hooks/use-workspace";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

export function WorkspaceDetails() {
  const { activeWorkspace, deleteWorkspace } = useWorkspace();
  const [showToken, setShowToken] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!activeWorkspace) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteWorkspace(activeWorkspace.id);
      if (success) {
        router.push("/workspaces");
      }
    } finally {
      setIsDeleting(false);
    }
  };

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

            <div className="pt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full sm:w-auto">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Workspace
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the workspace
                      and all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </>
        )}
      </div>
    </div>
  );
}