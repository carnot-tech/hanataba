import { config } from "dotenv";
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@/db/schema";

config({ path: ".env" }); 

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export const db = drizzle(process.env.DATABASE_URL, { schema });
