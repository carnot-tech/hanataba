ALTER TABLE "mcp_servers" DROP CONSTRAINT "mcp_servers_workspace_id_workspaces_id_fk";
--> statement-breakpoint
ALTER TABLE "mcp_servers" ADD CONSTRAINT "mcp_servers_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;