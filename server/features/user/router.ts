import { userEditSchema } from "@advanced-react/shared/schema/auth";
import { TRPCError } from "@trpc/server";
import { and, count, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "../../database";
import {
  experienceAttendeesTable,
  experienceSelectSchema,
  experiencesTable,
  notificationsTable,
  userFollowsTable,
} from "../../database/schema";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { DEFAULT_USER_LIMIT } from "../../utils/constants";
import { writeFile } from "../../utils/files";
import { cleanUserSelectSchema, usersTable } from "../auth/models";
import {
  getUserFollowContext,
  getUserFollowers,
  getUserFollowersCount,
  getUserFollowing,
  getUserFollowingCount,
  getUserHostedExperiencesCount,
} from "./helpers";

export const userRouter = router({
  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .output(
      cleanUserSelectSchema.extend({
        followersCount: z.number(),
        followingCount: z.number(),
        isFollowing: z.boolean(),
        hostedExperiencesCount: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, input.id),
        columns: {
          id: true,
          name: true,
          bio: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const [
        followersCount,
        followingCount,
        hostedExperiencesCount,
        userContext,
      ] = await Promise.all([
        getUserFollowersCount(input.id),
        getUserFollowingCount(input.id),
        getUserHostedExperiencesCount(input.id),
        getUserFollowContext(input.id, ctx.user?.id),
      ]);

      return {
        ...user,
        followersCount,
        followingCount,
        isFollowing: userContext.isFollowing,
        hostedExperiencesCount,
      };
    }),

  follow: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.id === input.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot follow yourself",
        });
      }

      const existingFollow = await db.query.userFollowsTable.findFirst({
        where: and(
          eq(userFollowsTable.followerId, ctx.user.id),
          eq(userFollowsTable.followingId, input.id),
        ),
      });

      if (existingFollow) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are already following this user",
        });
      }

      await db.insert(userFollowsTable).values({
        followerId: ctx.user.id,
        followingId: input.id,
        createdAt: new Date().toISOString(),
      });

      await db.insert(notificationsTable).values({
        type: "user_followed_user",
        fromUserId: ctx.user.id,
        userId: input.id,
        createdAt: new Date().toISOString(),
      });

      return { success: true };
    }),

  unfollow: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.id === input.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You cannot unfollow yourself",
        });
      }

      const existingFollow = await db.query.userFollowsTable.findFirst({
        where: and(
          eq(userFollowsTable.followerId, ctx.user.id),
          eq(userFollowsTable.followingId, input.id),
        ),
      });

      if (!existingFollow) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not following this user",
        });
      }

      await db
        .delete(userFollowsTable)
        .where(
          and(
            eq(userFollowsTable.followerId, ctx.user.id),
            eq(userFollowsTable.followingId, input.id),
          ),
        );

      return { success: true };
    }),

  followers: publicProcedure
    .input(
      z.object({
        id: z.number(),
        cursor: z.number().optional(),
        limit: z.number().optional(),
      }),
    )
    .output(
      z.object({
        items: z.array(
          cleanUserSelectSchema.extend({
            followersCount: z.number(),
            followingCount: z.number(),
            isFollowing: z.boolean(),
          }),
        ),
        followersCount: z.number(),
        nextCursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? DEFAULT_USER_LIMIT;
      const cursor = input.cursor ?? 0;

      const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, input.id),
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const followers = await getUserFollowers(input.id, limit + 1, cursor);
      const followersCount = await getUserFollowersCount(input.id);

      const items = await Promise.all(
        followers.slice(0, limit).map(async (f) => {
          const [followersCount, followingCount, userContext] =
            await Promise.all([
              getUserFollowersCount(f.follower.id),
              getUserFollowingCount(f.follower.id),
              getUserFollowContext(f.follower.id, ctx.user?.id),
            ]);

          return {
            ...f.follower,
            followersCount,
            followingCount,
            isFollowing: userContext.isFollowing,
          };
        }),
      );

      return {
        items,
        followersCount,
        nextCursor: followers.length > limit ? cursor + limit : undefined,
      };
    }),

  following: publicProcedure
    .input(
      z.object({
        id: z.number(),
        cursor: z.number().optional(),
        limit: z.number().optional(),
      }),
    )
    .output(
      z.object({
        items: z.array(
          cleanUserSelectSchema.extend({
            followersCount: z.number(),
            followingCount: z.number(),
            isFollowing: z.boolean(),
          }),
        ),
        followingCount: z.number(),
        nextCursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? DEFAULT_USER_LIMIT;
      const cursor = input.cursor ?? 0;

      const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, input.id),
      });

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const following = await getUserFollowing(input.id, limit + 1, cursor);
      const followingCount = await getUserFollowingCount(input.id);

      const items = await Promise.all(
        following.slice(0, limit).map(async (f) => {
          const [followersCount, followingCount, userContext] =
            await Promise.all([
              getUserFollowersCount(f.following.id),
              getUserFollowingCount(f.following.id),
              getUserFollowContext(f.following.id, ctx.user?.id),
            ]);

          return {
            ...f.following,
            followersCount,
            followingCount,
            isFollowing: userContext.isFollowing,
          };
        }),
      );

      return {
        items,
        followingCount,
        nextCursor: following.length > limit ? cursor + limit : undefined,
      };
    }),

  edit: protectedProcedure
    .input(userEditSchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.id !== input.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only update your own profile",
        });
      }

      let imagePath = ctx.user.avatarUrl;
      if (input.photo) {
        imagePath = await writeFile(input.photo);
      }

      const users = await db
        .update(usersTable)
        .set({
          name: input.name,
          bio: input.bio,
          avatarUrl: imagePath,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(usersTable.id, input.id))
        .returning();

      return users[0];
    }),

  experienceAttendees: publicProcedure
    .input(
      z.object({
        experienceId: experienceSelectSchema.shape.id,
        limit: z.number().optional(),
        cursor: z.number().optional(),
      }),
    )
    .output(
      z.object({
        attendees: z.array(
          cleanUserSelectSchema.extend({
            isFollowing: z.boolean(),
            followersCount: z.number(),
            followingCount: z.number(),
          }),
        ),
        attendeesCount: z.number(),
        nextCursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? DEFAULT_USER_LIMIT;
      const cursor = input.cursor ?? 0;

      const experience = await db.query.experiencesTable.findFirst({
        where: eq(experiencesTable.id, input.experienceId),
      });

      if (!experience) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Experience not found",
        });
      }

      const [attendeesCount] = await db
        .select({ count: count() })
        .from(experienceAttendeesTable)
        .where(eq(experienceAttendeesTable.experienceId, input.experienceId));

      const attendees = await db.query.experienceAttendeesTable.findMany({
        where: eq(experienceAttendeesTable.experienceId, input.experienceId),
        limit,
        offset: cursor,
        with: {
          user: true,
        },
      });

      const items = await Promise.all(
        attendees.map(async (attendee) => {
          const [followersCount, followingCount, userContext] =
            await Promise.all([
              getUserFollowersCount(attendee.user.id),
              getUserFollowingCount(attendee.user.id),
              getUserFollowContext(attendee.user.id, ctx.user?.id),
            ]);

          return {
            ...attendee.user,
            isFollowing: userContext.isFollowing,
            followersCount,
            followingCount,
          };
        }),
      );

      return {
        attendees: items,
        attendeesCount: attendeesCount?.count ?? 0,
        nextCursor: attendees.length === limit ? cursor + limit : undefined,
      };
    }),
});
