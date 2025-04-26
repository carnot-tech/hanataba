import { db } from "@/db/drizzle";
import { and, eq } from "drizzle-orm";
import { membershipsTable, mcpRunsTable } from "@/db/schema";

export const RunPolicy = () => {
	const isMember = async (userId: string, runId: string): Promise<boolean> => {
		const run = await db.query.mcpRunsTable.findFirst({
			where: eq(mcpRunsTable.id, runId),
			with: {
				mcp: {
					with: {
						workspace: {
							with: {
								memberships: {
									where: eq(membershipsTable.userId, userId),
								},
							},
						},
					},
				},
			},
		});
		return !!run?.mcp?.workspace?.memberships?.[0];
	};

	const isOwner = async (userId: string, runId: string): Promise<boolean> => {
		const run = await db.query.mcpRunsTable.findFirst({
			where: eq(mcpRunsTable.id, runId),
			with: {
				mcp: {
					with: {
						workspace: {
							with: {
								memberships: {
									where: and(
										eq(membershipsTable.userId, userId),
										eq(membershipsTable.role, "owner"),
									),
								},
							},
						},
					},
				},
			},
		});
		return !!run?.mcp?.workspace?.memberships?.[0];
	};

	return {
		canGet: async (userId: string, runId: string): Promise<boolean> => {
			return isMember(userId, runId);
		},
		canUpdate: async (userId: string, runId: string): Promise<boolean> => {
			return isOwner(userId, runId);
		},
		canDelete: async (userId: string, runId: string): Promise<boolean> => {
			return isOwner(userId, runId);
		},
	};
};
