import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

const apiKeysTable = sqliteTable("api_keys_table", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    owner: text("owner").notNull(),
    calls: int("calls").notNull().default(0),
});

type APIKey = typeof apiKeysTable.$inferSelect;
type InsertAPIKey = typeof apiKeysTable.$inferInsert;

export { apiKeysTable };
export type { APIKey, InsertAPIKey };
