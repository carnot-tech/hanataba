import { hc } from "hono/client";
import type { AppType } from "@/app/api/[[...route]]/route";

const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
export const client = hc<AppType>(url, {
	fetch: ((input, init) => {
		return fetch(input, {
			...init,
			credentials: "include",
		});
	}) satisfies typeof fetch,
});

type ClientType = typeof client;

export type { ClientType };
export * from "./types";
