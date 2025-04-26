"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Plus, X } from "lucide-react";
import type { MCPServerInsertType } from "@/lib/api-client/types";
import { useWorkspace } from "@/hooks/use-workspace";

interface MCPServerManagerProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (server: MCPServerInsertType) => void;
}

type ServerType = "sse" | "stdio";

interface SSEServerForm {
	name: string;
	description: string;
	url: string;
	headers: Record<string, string>;
}

interface StdioServerForm {
	name: string;
	description: string;
	command: string;
	args: string[];
	env: Record<string, string>;
}

interface KeyValuePair {
	key: string;
	value: string;
}

const initialSSEServer: SSEServerForm = {
	name: "",
	description: "",
	url: "",
	headers: {},
};

const initialStdioServer: StdioServerForm = {
	name: "",
	description: "",
	command: "",
	args: [],
	env: {},
};

export function MCPServerManager({
	isOpen,
	onClose,
	onSubmit,
}: MCPServerManagerProps) {
	const { activeWorkspace } = useWorkspace();
	const [serverType, setServerType] = useState<ServerType>("sse");
	const [sseServer, setSseServer] = useState<SSEServerForm>(initialSSEServer);
	const [stdioServer, setStdioServer] =
		useState<StdioServerForm>(initialStdioServer);
	const [newHeader, setNewHeader] = useState<KeyValuePair>({
		key: "",
		value: "",
	});
	const [newArg, setNewArg] = useState("");
	const [newEnv, setNewEnv] = useState<KeyValuePair>({ key: "", value: "" });

	const resetForms = () => {
		setSseServer(initialSSEServer);
		setStdioServer(initialStdioServer);
		setNewHeader({ key: "", value: "" });
		setNewArg("");
		setNewEnv({ key: "", value: "" });
	};

	const handleAddServer = () => {
		if (serverType === "sse") {
			if (!sseServer.url || !sseServer.name) return;
			onSubmit({
				type: "sse",
				name: sseServer.name,
				description: sseServer.description,
				url: sseServer.url,
				headers: JSON.stringify(sseServer.headers),
				workspaceId: activeWorkspace?.id ?? "",
			});
		} else {
			if (!stdioServer.command || !stdioServer.name) return;
			onSubmit({
				type: "stdio",
				name: stdioServer.name,
				description: stdioServer.description,
				command: stdioServer.command,
				args: JSON.stringify(stdioServer.args),
				env: JSON.stringify(stdioServer.env),
				workspaceId: activeWorkspace?.id ?? "",
			});
		}
		resetForms();
		onClose();
	};

	const renderServerTypeSelector = () => (
		<div className="space-y-2">
			<Label>Type</Label>
			<div className="flex gap-4">
				<Button
					variant={serverType === "sse" ? "default" : "outline"}
					onClick={() => setServerType("sse")}
				>
					SSE
				</Button>
				<Button
					variant={serverType === "stdio" ? "default" : "outline"}
					onClick={() => setServerType("stdio")}
				>
					Stdio
				</Button>
			</div>
		</div>
	);

	const renderSSEForm = () => (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="name">Name</Label>
				<Input
					id="name"
					value={sseServer.name}
					onChange={(e) => setSseServer({ ...sseServer, name: e.target.value })}
					placeholder="My SSE Server"
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<Input
					id="description"
					value={sseServer.description}
					onChange={(e) =>
						setSseServer({ ...sseServer, description: e.target.value })
					}
					placeholder="Description of the server"
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="url">URL</Label>
				<Input
					id="url"
					value={sseServer.url}
					onChange={(e) => setSseServer({ ...sseServer, url: e.target.value })}
					placeholder="https://example.com/api/mcp"
				/>
			</div>
			<div className="space-y-2">
				<Label>Headers</Label>
				<div className="flex gap-2">
					<Input
						value={newHeader.key}
						onChange={(e) =>
							setNewHeader({ ...newHeader, key: e.target.value })
						}
						placeholder="Key"
					/>
					<Input
						value={newHeader.value}
						onChange={(e) =>
							setNewHeader({ ...newHeader, value: e.target.value })
						}
						placeholder="Value"
					/>
					<Button
						type="button"
						size="icon"
						onClick={() => {
							if (!newHeader.key) return;
							const updatedHeaders = {
								...sseServer.headers,
								[newHeader.key]: newHeader.value,
							};
							setSseServer((prev) => ({
								...prev,
								headers: updatedHeaders,
							}));
							setNewHeader({ key: "", value: "" });
						}}
					>
						<Plus className="h-4 w-4" />
					</Button>
				</div>
				{Object.entries(sseServer.headers).length > 0 && (
					<div className="space-y-2">
						{Object.entries(sseServer.headers).map(([key, value]) => (
							<div key={`header-${key}`} className="flex items-center gap-2">
								<span className="text-sm font-mono">{key}</span>
								<span className="text-sm text-muted-foreground">=</span>
								<span className="text-sm text-muted-foreground">{value}</span>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={() => {
										const newHeaders = { ...sseServer.headers };
										delete newHeaders[key];
										setSseServer((prev) => ({
											...prev,
											headers: newHeaders,
										}));
									}}
								>
									<X className="h-3 w-3" />
								</Button>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);

	const renderStdioForm = () => (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="name">Name</Label>
				<Input
					id="name"
					value={stdioServer.name}
					onChange={(e) =>
						setStdioServer({ ...stdioServer, name: e.target.value })
					}
					placeholder="My Stdio Server"
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="description">Description</Label>
				<Input
					id="description"
					value={stdioServer.description}
					onChange={(e) =>
						setStdioServer({ ...stdioServer, description: e.target.value })
					}
					placeholder="Description of the server"
				/>
			</div>
			<div className="space-y-2">
				<Label htmlFor="command">Command</Label>
				<Input
					id="command"
					value={stdioServer.command}
					onChange={(e) =>
						setStdioServer({ ...stdioServer, command: e.target.value })
					}
					placeholder="python"
				/>
			</div>
			<div className="space-y-2">
				<Label>Arguments</Label>
				<div className="flex gap-2">
					<Input
						value={newArg}
						onChange={(e) => setNewArg(e.target.value)}
						placeholder="Argument"
					/>
					<Button
						type="button"
						size="icon"
						onClick={() => {
							if (!newArg) return;
							setStdioServer((prev) => ({
								...prev,
								args: [...prev.args, newArg],
							}));
							setNewArg("");
						}}
					>
						<Plus className="h-4 w-4" />
					</Button>
				</div>
				{stdioServer.args.length > 0 && (
					<div className="space-y-2">
						{stdioServer.args.map((arg) => (
							<div key={`arg-${arg}`} className="flex items-center gap-2">
								<span className="text-sm font-mono">{arg}</span>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={() => {
										setStdioServer((prev) => ({
											...prev,
											args: prev.args.filter((a) => a !== arg),
										}));
									}}
								>
									<X className="h-3 w-3" />
								</Button>
							</div>
						))}
					</div>
				)}
			</div>
			<div className="space-y-2">
				<Label>Environment Variables</Label>
				<div className="flex gap-2">
					<Input
						value={newEnv.key}
						onChange={(e) => setNewEnv({ ...newEnv, key: e.target.value })}
						placeholder="Key"
					/>
					<Input
						value={newEnv.value}
						onChange={(e) => setNewEnv({ ...newEnv, value: e.target.value })}
						placeholder="Value"
					/>
					<Button
						type="button"
						size="icon"
						onClick={() => {
							if (!newEnv.key) return;
							setStdioServer((prev) => ({
								...prev,
								env: { ...prev.env, [newEnv.key]: newEnv.value },
							}));
							setNewEnv({ key: "", value: "" });
						}}
					>
						<Plus className="h-4 w-4" />
					</Button>
				</div>
				{Object.entries(stdioServer.env).length > 0 && (
					<div className="space-y-2">
						{Object.entries(stdioServer.env).map(([key, value]) => (
							<div key={`env-${key}`} className="flex items-center gap-2">
								<span className="text-sm font-mono">{key}</span>
								<span className="text-sm text-muted-foreground">=</span>
								<span className="text-sm text-muted-foreground">{value}</span>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onClick={() => {
										const newEnv = { ...stdioServer.env };
										delete newEnv[key];
										setStdioServer((prev) => ({
											...prev,
											env: newEnv,
										}));
									}}
								>
									<X className="h-3 w-3" />
								</Button>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Add MCP Server</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					{renderServerTypeSelector()}
					{serverType === "sse" ? renderSSEForm() : renderStdioForm()}
					<DialogFooter>
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={handleAddServer}
							disabled={
								serverType === "sse"
									? !sseServer.url || !sseServer.name
									: !stdioServer.command || !stdioServer.name
							}
						>
							Add Server
						</Button>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	);
}
