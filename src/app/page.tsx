"use client";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function Page() {
  const onSignIn = async () => {
    await authClient.signIn.social({
      provider: "github",
    });
  };

	return (
		<div>
			<Button
				onClick={onSignIn}
			>
				Click me
			</Button>
		</div>
	);
}
