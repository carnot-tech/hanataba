import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/drizzle";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		github: {
			clientId: process.env.GITHUB_CLIENT_ID as string,
			clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
		},
	},
	user: {
		modelName: "usersTable",
	},
	session: {
		modelName: "sessionsTable",
	},
	account: {
		modelName: "accountsTable",
	},
	verification: {
		modelName: "verificationsTable",
	},
});
