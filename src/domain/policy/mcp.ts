import { db } from "@/db/drizzle";
import { and, eq } from "drizzle-orm";
import { membershipsTable, mcpServersTable } from "@/db/schema";

export const McpPolicy = () => {
	const isMember = async (userId: string, mcpId: string): Promise<boolean> => {
		const mcp = await db.query.mcpServersTable.findFirst({
			where: eq(mcpServersTable.id, mcpId),
			with: {
				workspace: {
					with: {
						memberships: {
							where: eq(membershipsTable.userId, userId),
						},
					},
				},
			},
		});
		return !!mcp?.workspace?.memberships?.[0];
	};

	const isOwner = async (userId: string, mcpId: string): Promise<boolean> => {
		const mcp = await db.query.mcpServersTable.findFirst({
			where: eq(mcpServersTable.id, mcpId),
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
		});
		return !!mcp?.workspace?.memberships?.[0];
	};

	return {
		canGet: async (userId: string, mcpId: string): Promise<boolean> => {
			return isMember(userId, mcpId);
		},
		canCreate: async (userId: string, mcpId: string): Promise<boolean> => {
			return isMember(userId, mcpId);
		},
		canUpdate: async (userId: string, mcpId: string): Promise<boolean> => {
			return isOwner(userId, mcpId);
		},
		canDelete: async (userId: string, mcpId: string): Promise<boolean> => {
			return isOwner(userId, mcpId);
		},
	};
};
