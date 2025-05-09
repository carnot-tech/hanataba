"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WorkspaceList } from "@/components/workspace-list";
import type { WorkspaceType } from "@/lib/api-client";
import { useState, useEffect } from "react";
import { client } from "@/lib/api-client";

export default function Page() {
	const [workspaces, setWorkspaces] = useState<WorkspaceType[]>([]);

	useEffect(() => {
		const fetchWorkspaces = async () => {
			const response = await client.api.v1.workspaces.$get();
			if (response.ok) {
				const data = await response.json();
				setWorkspaces(data);
			}
		};
		fetchWorkspaces();
	}, []);

	return (
		<div className="flex flex-col gap-10">
			<div className="flex justify-between items-center">
				<h1 className="text-[28px] font-semibold">Select Workspace</h1>
				<Button variant="outline" asChild>
					<Link href="/workspaces/new">Create Workspace</Link>
				</Button>
			</div>

			{workspaces.length === 0 ? (
				<div className="text-center py-12">
					<p className="text-lg text-muted-foreground mb-4">
						No workspaces have been created yet
					</p>
					<Button variant="outline" asChild>
						<Link href="/workspaces/new">
							Create your first workspace
						</Link>
					</Button>
				</div>
			) : (
				<WorkspaceList workspaces={workspaces} />
			)}
		</div>
	);
}
