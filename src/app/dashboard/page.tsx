import { Card } from "@/components/ui/card";

export default function Page() {
	return (
		<div className="space-y-8">
			<div className="flex flex-col items-center justify-center space-y-4 text-center">
				<h1 className="text-4xl font-bold tracking-tight">Welcome to Hanataba</h1>
				<p className="text-xl text-muted-foreground max-w-2xl">
					Your platform for executing external services through MCP
				</p>
			</div>
			
			<div className="grid auto-rows-min gap-6 md:grid-cols-3">
				<Card className="p-6 border-none bg-muted/30">
					<h2 className="text-xl font-semibold mb-2">Seamless Integration</h2>
					<p className="text-muted-foreground">
						Connect and execute services across multiple cloud platforms with ease
					</p>
				</Card>
				<Card className="p-6 border-none bg-muted/30">
					<h2 className="text-xl font-semibold mb-2">Unified Management</h2>
					<p className="text-muted-foreground">
						Manage all your external services from a single, intuitive interface
					</p>
				</Card>
				<Card className="p-6 border-none bg-muted/30">
					<h2 className="text-xl font-semibold mb-2">Enhanced Security</h2>
					<p className="text-muted-foreground">
						Secure execution of services with built-in authentication and authorization
					</p>
				</Card>
			</div>

			<Card className="p-8 border-none bg-muted/30">
				<div className="space-y-4">
					<h2 className="text-2xl font-semibold">Getting Started</h2>
					<p className="text-muted-foreground">
						Begin by connecting your external services and configuring your execution environment.
						Our platform provides a robust foundation for managing and executing your services
						across multiple cloud providers.
					</p>
				</div>
			</Card>
		</div>
	);
}
