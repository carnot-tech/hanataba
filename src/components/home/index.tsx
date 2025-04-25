"use client";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export default function Home() {
  const handleSignInByGithub = async () => {
		await authClient.signIn.social({
			provider: "github",
		});
	};

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1 text-center">
					<CardTitle className="text-3xl font-bold">Hanataba</CardTitle>
					<CardDescription>
						Integration Platform for MCP
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex flex-col space-y-2">
						<Button
							variant="outline"
							className="w-full"
							onClick={handleSignInByGithub}
						>
							Sign in with GitHub
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
