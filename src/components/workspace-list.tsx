import Link from "next/link";
import type { WorkspaceType } from "@/lib/api-client";

interface WorkspaceListProps {
  workspaces: WorkspaceType[];
}

export function WorkspaceList({ workspaces }: WorkspaceListProps) {
  return (
    <div className="space-y-2">
      {workspaces.map((workspace) => (
        <Link
          key={workspace.id}
          href={`/?workspaceId=${workspace.id}`}
          className="block"
        >
          <div className="group flex justify-between items-center px-4 py-3.5 rounded-lg border bg-background hover:bg-muted transition-colors cursor-pointer">
            <span className="text-[15px] group-hover:text-foreground">
              {workspace.name}
            </span>
            <div className="flex items-center gap-4">
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