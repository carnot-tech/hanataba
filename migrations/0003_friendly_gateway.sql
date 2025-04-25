CREATE TYPE "public"."mcp_run_status" AS ENUM('running', 'success', 'error');--> statement-breakpoint
CREATE TABLE "mcp_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"mcp_id" text NOT NULL,
	"tool_id" text NOT NULL,
	"status" "mcp_run_status" NOT NULL,
	"parameters" jsonb NOT NULL,
	"result" jsonb,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mcp_runs" ADD CONSTRAINT "mcp_runs_mcp_id_mcp_servers_id_fk" FOREIGN KEY ("mcp_id") REFERENCES "public"."mcp_servers"("id") ON DELETE no action ON UPDATE no action;