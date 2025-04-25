"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { client, type UserType } from "@/lib/api-client";
import { useState } from "react";

export default function Page() {
	const [user, setUser] = useState<UserType | null>(null);
	const onSignIn = async () => {
		await authClient.signIn.social({
			provider: "github",
		});
	};

	const onSignInEmail = async () => {
		await authClient.signUp.email({
			email: "test@example.com",
			password: "password1234",
			name: "test",
			image: "https://example.com/image.png",
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
			<Button onClick={onSignInEmail}>Sign in email</Button>
			<Button onClick={onGetMe}>Get me</Button>
			{user && <div>{JSON.stringify(user)}</div>}
		</div>
	);
}
