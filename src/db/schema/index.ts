import { pgTable, varchar, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const usersTable = pgTable("users", {
	id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).notNull().unique(),
});