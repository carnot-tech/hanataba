"use client"

import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { useWorkspace } from "@/hooks/use-workspace";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
	const { useSession } = authClient;
  const { activeWorkspace, isLoading } = useWorkspace();
	const { data: session, isPending } = useSession();
  if (!session?.user.id && !isPending) {
    return redirect("/");
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!activeWorkspace) {
    return redirect("/workspaces/new");
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
