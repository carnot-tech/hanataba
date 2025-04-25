"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { client, type UserType } from "@/lib/client";
import { useState } from "react";

export default function Page() {
	const [user, setUser] = useState<UserType | null>(null);
	const onSignIn = async () => {
		await authClient.signIn.social({
			provider: "github",
		});
	};

	const onGetMe = async () => {
		const res = await client.api.v1.users.me.$get();
		if (res.ok) {
			const data = await res.json();
			setUser(data);
		}
	};

	return (
		<div>
			<Button onClick={onSignIn}>Sign in</Button>
			<Button onClick={onGetMe}>Get me</Button>
			{user && <div>{JSON.stringify(user)}</div>}
		</div>
	);
}
