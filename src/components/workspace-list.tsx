import Link from "next/link";
import type { WorkspaceType } from "@/lib/api-client";
import { useWorkspace } from "@/hooks/use-workspace";

interface WorkspaceListProps {
  workspaces: WorkspaceType[];
}

export function WorkspaceList({ workspaces }: WorkspaceListProps) {
  const { activeWorkspace, setWorkspace } = useWorkspace();
  
  return (
    <div className="space-y-2">
      {workspaces.map((workspace) => (
        <Link
          key={workspace.id}
          href={`/?workspaceId=${workspace.id}`}
          className="block"
          onClick={() => setWorkspace(workspace)}
        >
          <div className="group flex justify-between items-center px-4 py-3.5 rounded-lg border bg-background hover:bg-muted transition-colors cursor-pointer">
            <span className="text-[15px] group-hover:text-foreground">
              {workspace.name}
            </span>
            <div className="flex items-center gap-4">
              {activeWorkspace?.id === workspace.id && (
                <svg
                  className="w-5 h-5 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <svg
                className="w-5 h-5 text-muted-foreground group-hover:text-foreground/70"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 