"use client";

import { authClient } from "@/lib/auth-client";
import Home from "@/components/home";
import { redirect } from "next/navigation";

export default function Page() {
	const { useSession } = authClient;
	const { data: session } = useSession();
	if (session?.user.id) {
		return redirect("/dashboard");
	}

	return <Home />;
}
