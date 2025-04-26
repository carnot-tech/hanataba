ALTER TABLE "mcp_runs" DROP CONSTRAINT "mcp_runs_mcp_id_mcp_servers_id_fk";
--> statement-breakpoint
ALTER TABLE "mcp_runs" ADD CONSTRAINT "mcp_runs_mcp_id_mcp_servers_id_fk" FOREIGN KEY ("mcp_id") REFERENCES "public"."mcp_servers"("id") ON DELETE cascade ON UPDATE no action;