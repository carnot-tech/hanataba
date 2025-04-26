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
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

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

interface StdioServerConfig {
	command: string;
	args: string[];
	env: Record<string, string>;
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
	const [jsonInput, setJsonInput] = useState("");

	const resetForms = () => {
		setSseServer(initialSSEServer);
		setStdioServer(initialStdioServer);
		setNewHeader({ key: "", value: "" });
		setNewArg("");
		setNewEnv({ key: "", value: "" });
		setJsonInput("");
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

	const renderStdioForm = () => {
		const handleJsonChange = (jsonStr: string) => {
			setJsonInput(jsonStr);
			try {
				const config = JSON.parse(jsonStr) as Partial<StdioServerConfig>;
				setStdioServer({
					...stdioServer,
					command: config.command ?? "",
					args: Array.isArray(config.args) ? config.args : [],
					env: typeof config.env === 'object' && config.env !== null ? config.env : {}
				});
			} catch {
				// Invalid JSON, keep the input but don't update the form
			}
		};

		const handleIndividualChange = <T extends keyof StdioServerForm>(
			field: T,
			value: StdioServerForm[T]
		) => {
			const updatedServer = { ...stdioServer, [field]: value };
			setStdioServer(updatedServer);
			// Update JSON input when individual fields change
			setJsonInput(JSON.stringify({
				command: updatedServer.command,
				args: updatedServer.args,
				env: updatedServer.env
			}, null, 2));
		};

		const validateServerConfig = (): boolean => {
			if (!stdioServer.command) {
				return false;
			}
			if (!Array.isArray(stdioServer.args)) {
				return false;
			}
			if (typeof stdioServer.env !== 'object' || stdioServer.env === null) {
				return false;
			}
			return true;
		};

		const handleAddArgument = () => {
			if (!newArg) return;
			handleIndividualChange('args', [...stdioServer.args, newArg]);
			setNewArg("");
		};

		const handleRemoveArgument = (arg: string) => {
			handleIndividualChange('args', stdioServer.args.filter((a) => a !== arg));
		};

		const handleAddEnvironment = () => {
			if (!newEnv.key) return;
			handleIndividualChange('env', { ...stdioServer.env, [newEnv.key]: newEnv.value });
			setNewEnv({ key: "", value: "" });
		};

		const handleRemoveEnvironment = (key: string) => {
			const newEnv = { ...stdioServer.env };
			delete newEnv[key];
			handleIndividualChange('env', newEnv);
		};

		return (
			<div className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="name">Name</Label>
					<Input
						id="name"
						value={stdioServer.name}
						onChange={(e) => handleIndividualChange('name', e.target.value)}
						placeholder="My Stdio Server"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="description">Description</Label>
					<Input
						id="description"
						value={stdioServer.description}
						onChange={(e) => handleIndividualChange('description', e.target.value)}
						placeholder="Description of the server"
					/>
				</div>
				<div className="space-y-2">
					<Label>Configuration (JSON)</Label>
					<textarea
						className="w-full h-32 p-2 border rounded-md font-mono text-sm"
						value={jsonInput}
						onChange={(e) => handleJsonChange(e.target.value)}
						placeholder={`{
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-slack"],
  "env": {
    "SLACK_BOT_TOKEN": "xoxb-your-bot-token",
    "SLACK_TEAM_ID": "T01234567",
    "SLACK_CHANNEL_IDS": "C01234567, C76543210"
  }
}`}
					/>
				</div>
				<Accordion type="single" collapsible className="w-full">
					<AccordionItem value="individual-fields">
						<AccordionTrigger>Individual Fields</AccordionTrigger>
						<AccordionContent>
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="command">Command</Label>
									<Input
										id="command"
										value={stdioServer.command}
										onChange={(e) => handleIndividualChange('command', e.target.value)}
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
											onClick={handleAddArgument}
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
														onClick={() => handleRemoveArgument(arg)}
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
											onClick={handleAddEnvironment}
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
														onClick={() => handleRemoveEnvironment(key)}
													>
														<X className="h-3 w-3" />
													</Button>
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
				<DialogFooter>
					<Button type="button" variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={() => {
							if (!validateServerConfig()) {
								alert('Invalid server configuration. Please check your input.');
								return;
							}
							handleAddServer();
						}}
						disabled={!stdioServer.name}
					>
						Add Server
					</Button>
				</DialogFooter>
			</div>
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Add MCP Server</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					{renderServerTypeSelector()}
					{serverType === "sse" ? renderSSEForm() : renderStdioForm()}
				</div>
			</DialogContent>
		</Dialog>
	);
}
