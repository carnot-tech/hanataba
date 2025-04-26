import { db } from "@/db/drizzle";
import { and, eq } from "drizzle-orm";
import { membershipsTable } from "@/db/schema";

export const WorkspacePolicy = () => {
	const isMember = async (userId: string, workspaceId: string): Promise<boolean> => {
		const membership = await db.query.membershipsTable.findFirst({
			where: and(
				eq(membershipsTable.userId, userId),
				eq(membershipsTable.workspaceId, workspaceId),
			),
		});
		return !!membership;
	};
	const isOwner = async (userId: string, workspaceId: string): Promise<boolean> => {
		const membership = await db.query.membershipsTable.findFirst({
			where: and(
				eq(membershipsTable.userId, userId),
				eq(membershipsTable.workspaceId, workspaceId),
				eq(membershipsTable.role, "owner"),
			),
		});
		return !!membership;
	};

	return {
		canGet: async (userId: string, workspaceId: string): Promise<boolean> => {
			return isMember(userId, workspaceId);
		},
		canUpdate: async (userId: string, workspaceId: string): Promise<boolean> => {
			return isOwner(userId, workspaceId);
		},
		canDelete: async (userId: string, workspaceId: string): Promise<boolean> => {
			return isOwner(userId, workspaceId);
		},
	};
};
