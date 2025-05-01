import { and, count, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "../../database";
import { protectedProcedure, router } from "../../trpc";
import { DEFAULT_NOTIFICATION_LIMIT } from "../../utils/constants";
import { User } from "../auth/models";
import {
  Notification,
  notificationSelectSchema,
  notificationsTable,
} from "./models";

export const notificationRouter = router({
  feed: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        cursor: z.number().optional(),
      }),
    )
    .output(
      z.object({
        notifications: z.array(
          notificationSelectSchema.extend({
            content: z.string(),
          }),
        ),
        nextCursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? DEFAULT_NOTIFICATION_LIMIT;
      const cursor = input?.cursor ?? 0;

      const notifications = await db.query.notificationsTable.findMany({
        where: eq(notificationsTable.userId, ctx.user.id),
        limit: limit,
        offset: cursor,
        orderBy: desc(notificationsTable.createdAt),
        with: {
          fromUser: {
            columns: {
              name: true,
            },
          },
        },
      });

      const notificationsWithContent = notifications.map((notification) => ({
        ...notification,
        content: getNotificationContent(notification),
      }));

      console.log(notificationsWithContent);

      return {
        notifications: notificationsWithContent,
        nextCursor: notifications.length === limit ? cursor + limit : undefined,
      };
    }),

  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    const result = await db
      .select({ count: count() })
      .from(notificationsTable)
      .where(
        and(
          eq(notificationsTable.userId, ctx.user.id),
          eq(notificationsTable.read, false),
        ),
      );

    return result[0].count;
  }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .update(notificationsTable)
        .set({ read: true })
        .where(
          and(
            eq(notificationsTable.id, input.id),
            eq(notificationsTable.userId, ctx.user.id),
          ),
        );
    }),
});

function getNotificationContent(
  notification: Notification & {
    fromUser: Pick<User, "name"> | null;
  },
): string {
  console.log(notification.type);
  switch (notification.type) {
    case "user_attending_experience":
      return `${notification.fromUser?.name} is attending your experience`;
    case "user_unattending_experience":
      return `${notification.fromUser?.name} is no longer attending your experience`;
    case "user_commented_experience":
      return `${notification.fromUser?.name} commented on your experience`;
    case "user_followed_user":
      return `${notification.fromUser?.name} followed you`;
    case "user_kicked_experience":
      return `${notification.fromUser?.name} kicked you from the experience`;
    default:
      return "New notification";
  }
}
