import { Card } from "@/components/ui/card";

export default function Page() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-bold">Dashboard</h1>
			</div>
			<div className="grid auto-rows-min gap-4 md:grid-cols-3">
				<Card className="border-none bg-muted/30 aspect-video" />
				<Card className="border-none bg-muted/30 aspect-video" />
				<Card className="border-none bg-muted/30 aspect-video" />
			</div>
			<Card className="border-none bg-muted/30 min-h-[100vh] flex-1 md:min-h-min" />
		</div>
	);
}
