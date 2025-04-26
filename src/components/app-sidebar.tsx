"use client"

import * as React from "react"
import {
  Home,
  ListCheck as Runs,
  Blocks as MCPs,
  SettingsIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { NavSecondary } from "@/components/nav-secondary"
import { WorkspaceSwitcher } from "@/components/workspace-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client"
import type { User } from "better-auth"
import { client, type WorkspaceType } from "@/lib/api-client"

const data = {
  navMain: [
    {
      title: "Home",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "MCPs",
      url: "/dashboard/mcps",
      icon: MCPs,
    },
    {
      title: "Runs",
      url: "/dashboard/runs",
      icon: Runs,
    }
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: SettingsIcon,
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {  
  const [user, setUser] = React.useState<User | null>(null)
  const [workspaces, setWorkspaces] = React.useState<WorkspaceType[]>([])
  
  React.useEffect(() => {
    async function fetchUser() {
      const { data, error } = await authClient.getSession()
      if (error) {
        console.error(error)
        return
      }
      if (data?.user) {
        setUser(data.user)
      }
    }
    fetchUser()
  }, [])

  React.useEffect(() => {
    async function fetchWorkspaces() {
      const response = await client.api.v1.workspaces.$get()
      if (response.status !== 200) {
        return
      }
      const data = await response.json()
      setWorkspaces(data)
    }
    fetchWorkspaces()
  }, [])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <WorkspaceSwitcher workspaces={workspaces} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user ? {
          name: user.name,
          email: user.email,
          avatar: user.image || "/avatars/default.jpg"
        } : null} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
