import {
	pgTable,
	text,
	timestamp,
	pgEnum,
	jsonb,
	varchar,
} from "drizzle-orm/pg-core";
import { usersTable } from "./better-auth";
import { createSchemaFactory } from "drizzle-zod";
import { relations } from "drizzle-orm";

const { createSelectSchema, createInsertSchema, createUpdateSchema } =
	createSchemaFactory({
		coerce: {
			date: true,
		},
	});

export const workspacesTable = pgTable("workspaces", {
	id: text("id").primaryKey(),
	name: varchar("name", { length: 256 }).notNull(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const workspacesRelations = relations(workspacesTable, ({ many }) => ({
	memberships: many(membershipsTable),
	mcps: many(mcpServersTable),
}));
export const workspaceSelectSchema = createSelectSchema(workspacesTable);
export const workspaceInsertSchema = createInsertSchema(workspacesTable);
export const workspaceUpdateSchema = createUpdateSchema(workspacesTable);


export const membershipRoleEnum = pgEnum("membership_role", [
	"owner",
	"member",
]);
export const membershipsTable = pgTable("memberships", {
	id: text("id").primaryKey(),
	workspaceId: text("workspace_id")
		.references(() => workspacesTable.id, { onDelete: "cascade" })
		.notNull(),
	userId: text("user_id")
		.references(() => usersTable.id)
		.notNull(),
	role: membershipRoleEnum("role").notNull().default("member"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const membershipsRelations = relations(membershipsTable, ({ one }) => ({
	workspace: one(workspacesTable, {
		fields: [membershipsTable.workspaceId],
		references: [workspacesTable.id],
	}),
	user: one(usersTable, {
		fields: [membershipsTable.userId],
		references: [usersTable.id],
	}),
}));
export const membershipSelectSchema = createSelectSchema(membershipsTable);
export const membershipInsertSchema = createInsertSchema(membershipsTable);
export const membershipUpdateSchema = createUpdateSchema(membershipsTable);

export const mcpServerTypes = pgEnum("mcp_server_types", ["stdio", "sse"]);
export const mcpServersTable = pgTable("mcp_servers", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.references(() => usersTable.id)
		.notNull(),
	workspaceId: text("workspace_id")
		.references(() => workspacesTable.id)
		.notNull(),
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
export const mcpServersRelations = relations(mcpServersTable, ({ one }) => ({
	workspace: one(workspacesTable, {
		fields: [mcpServersTable.workspaceId],
		references: [workspacesTable.id],
	}),
}));
export const mcpServerSelectSchema = createSelectSchema(mcpServersTable);
export const mcpServerInsertSchema = createInsertSchema(mcpServersTable);
export const mcpServerUpdateSchema = createUpdateSchema(mcpServersTable);

export const mcpRunStatusEnum = pgEnum("mcp_run_status", [
	"running",
	"success",
	"error",
]);
export const mcpRunsTable = pgTable("mcp_runs", {
	id: text("id").primaryKey(),
	mcpId: text("mcp_id")
		.references(() => mcpServersTable.id)
		.notNull(),
	toolId: text("tool_id").notNull(),
	status: mcpRunStatusEnum("status").notNull(),
	parameters: jsonb("parameters").notNull(),
	result: jsonb("result"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});
export const mcpRunsRelations = relations(mcpRunsTable, ({ one }) => ({
	mcp: one(mcpServersTable, {
		fields: [mcpRunsTable.mcpId],
		references: [mcpServersTable.id],
	}),
}));
export const mcpRunSelectSchema = createSelectSchema(mcpRunsTable);
export const mcpRunInsertSchema = createInsertSchema(mcpRunsTable);
export const mcpRunUpdateSchema = createUpdateSchema(mcpRunsTable);

export * from "./better-auth";
