import { index, int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";

export const tagsTable = sqliteTable(
  "tags",
  {
    id: int().primaryKey({ autoIncrement: true }),
    name: text("name").notNull().unique(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => ({
    tags_name_idx: index("tags_name_idx").on(table.name),
  }),
);

export const tagSelectSchema = createSelectSchema(tagsTable);

export type Tag = typeof tagsTable.$inferSelect;
