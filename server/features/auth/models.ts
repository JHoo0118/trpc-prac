import { int, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";

export const usersTable = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  bio: text(),
  avatarUrl: text(),
  email: text().notNull().unique(),
  password: text().notNull(),
  createdAt: text().notNull(),
  updatedAt: text().notNull(),
});

export const userSelectSchema = createSelectSchema(usersTable);
export const cleanUserSelectSchema = userSelectSchema.omit({
  password: true,
  email: true,
});

export const userFollowsTable = sqliteTable(
  "user_follows",
  {
    followerId: int("follower_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    followingId: int("following_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: text("created_at").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.followerId, table.followingId] }),
  }),
);

type FullUser = typeof usersTable.$inferSelect;

export type CurrentUser = FullUser;

export type User = Omit<FullUser, "email" | "password">;
