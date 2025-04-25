import { pgTable, text, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { usersTable } from "./better-auth";
import { createSchemaFactory } from "drizzle-zod";

const { createSelectSchema, createInsertSchema, createUpdateSchema } = createSchemaFactory({
	coerce: {
		date: true,
	},
});

export const mcpServerTypes = pgEnum("mcp_server_types", ["stdio", "sse"]);
export const mcpServersTable = pgTable("mcp_servers", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => usersTable.id).notNull(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  type: mcpServerTypes("type").notNull(),
  url: text("url"),
  headers: jsonb("headers"),
  command: text("command"),
  args: text("args"),
  env: jsonb("env"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});
export const mcpServerSelectSchema = createSelectSchema(mcpServersTable);
export const mcpServerInsertSchema = createInsertSchema(mcpServersTable);
export const mcpServerUpdateSchema = createUpdateSchema(mcpServersTable);

export const mcpRunStatusEnum = pgEnum("mcp_run_status", ["running", "success", "error"]);
export const mcpRunsTable = pgTable("mcp_runs", {
  id: text("id").primaryKey(),
  mcpId: text("mcp_id").references(() => mcpServersTable.id).notNull(),
  toolId: text("tool_id").notNull(),
  status: mcpRunStatusEnum("status").notNull(),
  parameters: jsonb("parameters").notNull(),
  result: jsonb("result"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});
export const mcpRunSelectSchema = createSelectSchema(mcpRunsTable);
export const mcpRunInsertSchema = createInsertSchema(mcpRunsTable);
export const mcpRunUpdateSchema = createUpdateSchema(mcpRunsTable);

export * from "./better-auth";

