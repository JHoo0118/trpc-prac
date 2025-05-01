import { index, int, text } from "drizzle-orm/sqlite-core";
import { sqliteTable } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";

import { usersTable } from "../auth/models";
import { commentsTable } from "../comment/models";
import { experiencesTable } from "../experience/models";

const notificationTypeEnum = [
  "user_attending_experience",
  "user_unattending_experience",
  "user_commented_experience",
  "user_followed_user",
  "user_kicked_experience",
] as const;

export const notificationsTable = sqliteTable(
  "notifications",
  {
    id: int().primaryKey({ autoIncrement: true }),
    type: text("type", {
      enum: notificationTypeEnum,
    }).notNull(),
    read: int("read", { mode: "boolean" }).notNull().default(false),

    commentId: int("comment_id").references(() => commentsTable.id, {
      onDelete: "cascade",
    }),
    experienceId: int("experience_id").references(() => experiencesTable.id, {
      onDelete: "cascade",
    }),
    fromUserId: int("from_user_id")
      .notNull()
      .references(() => usersTable.id, {
        onDelete: "cascade",
      }),
    userId: int("user_id").references(() => usersTable.id, {
      onDelete: "cascade",
    }),

    createdAt: text("created_at").notNull(),
  },
  (table) => ({
    notifications_experience_id_idx: index(
      "notifications_experience_id_idx",
    ).on(table.experienceId),
    notifications_comment_id_idx: index("notifications_comment_id_idx").on(
      table.commentId,
    ),
    notifications_from_user_id_idx: index("notifications_from_user_id_idx").on(
      table.fromUserId,
    ),
    notifications_user_id_idx: index("notifications_user_id_idx").on(
      table.userId,
    ),
  }),
);

export const notificationSelectSchema = createSelectSchema(notificationsTable);

export type Notification = typeof notificationsTable.$inferSelect;
