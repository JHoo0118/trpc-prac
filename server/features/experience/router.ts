import {
  experienceFiltersSchema,
  experienceValidationSchema,
} from "@advanced-react/shared/schema/experience";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, inArray, like, or } from "drizzle-orm";
import { z } from "zod";

import { db } from "../../database";
import {
  cleanUserSelectSchema,
  experienceAttendeesTable,
  experienceFavoritesTable,
  experienceSelectSchema,
  experiencesTable,
  experienceTagsTable,
  notificationsTable,
  tagSelectSchema,
} from "../../database/schema";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { DEFAULT_EXPERIENCE_LIMIT } from "../../utils/constants";
import { writeFile } from "../../utils/files";
import {
  getExperienceAttendees,
  getExperienceAttendeesCount,
  getExperienceCommentsCount,
  getExperienceFavoritesCount,
  getExperienceTags,
  getExperienceUserContext,
} from "./helpers";

export const experienceRouter = router({
  byId: publicProcedure
    .input(z.object({ id: experienceSelectSchema.shape.id }))
    .output(
      experienceSelectSchema.extend({
        attendees: z.array(cleanUserSelectSchema),
        attendeesCount: z.number(),
        commentsCount: z.number(),
        favoritesCount: z.number(),
        isAttending: z.boolean(),
        isFavorited: z.boolean(),
        tags: z.array(tagSelectSchema),
        user: cleanUserSelectSchema,
      }),
    )
    .query(async ({ ctx, input }) => {
      const experience = await db.query.experiencesTable.findFirst({
        where: eq(experiencesTable.id, input.id),
        with: {
          user: {
            columns: {
              email: false,
              password: false,
            },
          },
        },
      });

      if (!experience) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Experience not found",
        });
      }

      const [
        commentsCount,
        attendeesCount,
        favoritesCount,
        userContext,
        attendees,
        tags,
      ] = await Promise.all([
        getExperienceCommentsCount(input.id),
        getExperienceAttendeesCount(input.id),
        getExperienceFavoritesCount(input.id),
        getExperienceUserContext(input.id, ctx.user?.id),
        getExperienceAttendees(input.id),
        getExperienceTags(input.id),
      ]);

      return {
        ...experience,
        commentsCount,
        attendeesCount,
        favoritesCount,
        attendees,
        tags,
        ...userContext,
      };
    }),

  feed: publicProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        cursor: z.number().optional(),
      }),
    )
    .output(
      z.object({
        experiences: z.array(
          experienceSelectSchema.extend({
            attendeesCount: z.number(),
            commentsCount: z.number(),
            favoritesCount: z.number(),
            isAttending: z.boolean(),
            isFavorited: z.boolean(),
            tags: z.array(tagSelectSchema),
            user: cleanUserSelectSchema,
          }),
        ),
        nextCursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? DEFAULT_EXPERIENCE_LIMIT;
      const cursor = input?.cursor ?? 0;

      const experiences = await db.query.experiencesTable.findMany({
        limit,
        offset: cursor,
        with: {
          user: {
            columns: {
              password: false,
              email: false,
            },
          },
        },
        // orderBy: desc(experiencesTable.createdAt),
      });

      const commentsCountResults = await Promise.all(
        experiences.map((experience) =>
          getExperienceCommentsCount(experience.id),
        ),
      );

      const attendeesCountResults = await Promise.all(
        experiences.map((experience) =>
          getExperienceAttendeesCount(experience.id),
        ),
      );

      const userContextResults = await Promise.all(
        experiences.map((experience) =>
          getExperienceUserContext(experience.id, ctx.user?.id),
        ),
      );

      const tagResults = await Promise.all(
        experiences.map((experience) => getExperienceTags(experience.id)),
      );

      const favoritesCountResults = await Promise.all(
        experiences.map((experience) =>
          getExperienceFavoritesCount(experience.id),
        ),
      );

      return {
        experiences: experiences.map((experience, index) => ({
          ...experience,
          commentsCount: commentsCountResults[index] ?? 0,
          attendeesCount: attendeesCountResults[index] ?? 0,
          isAttending: !!userContextResults[index].isAttending,
          tags: tagResults[index],
          isFavorited: !!userContextResults[index].isFavorited,
          favoritesCount: favoritesCountResults[index] ?? 0,
        })),
        nextCursor: experiences.length === limit ? cursor + limit : undefined,
      };
    }),

  search: publicProcedure
    .input(
      z
        .object({
          limit: z.number().optional(),
          cursor: z.number().optional(),
        })
        .merge(experienceFiltersSchema),
    )
    .output(
      z.object({
        experiences: z.array(
          experienceSelectSchema.extend({
            attendeesCount: z.number(),
            commentsCount: z.number(),
            favoritesCount: z.number(),
            isAttending: z.boolean(),
            isFavorited: z.boolean(),
            tags: z.array(tagSelectSchema),
            user: cleanUserSelectSchema,
          }),
        ),
        nextCursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? DEFAULT_EXPERIENCE_LIMIT;
      const cursor = input.cursor ?? 0;

      const whereConditions = [];

      if (input.q) {
        whereConditions.push(
          or(
            like(experiencesTable.title, `%${input.q}%`),
            like(experiencesTable.content, `%${input.q}%`),
          ),
        );
      }

      if (input.scheduledAt) {
        whereConditions.push(
          gte(experiencesTable.scheduledAt, input.scheduledAt),
        );
      }

      if (input.tags?.length) {
        const taggedExperiences = await db
          .select({ experienceId: experienceTagsTable.experienceId })
          .from(experienceTagsTable)
          .where(inArray(experienceTagsTable.tagId, input.tags));

        const experienceIds = taggedExperiences.map((e) => e.experienceId);

        whereConditions.push(inArray(experiencesTable.id, experienceIds));
      }

      const experiences = await db.query.experiencesTable.findMany({
        limit,
        offset: cursor,
        where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
        with: {
          user: {
            columns: {
              password: false,
              email: false,
            },
          },
        },
        orderBy: desc(experiencesTable.createdAt),
      });

      const commentsCountResults = await Promise.all(
        experiences.map((experience) =>
          getExperienceCommentsCount(experience.id),
        ),
      );

      const attendeesCountResults = await Promise.all(
        experiences.map((experience) =>
          getExperienceAttendeesCount(experience.id),
        ),
      );

      const userContextResults = await Promise.all(
        experiences.map((experience) =>
          getExperienceUserContext(experience.id, ctx.user?.id),
        ),
      );

      const tagResults = await Promise.all(
        experiences.map((experience) => getExperienceTags(experience.id)),
      );

      const favoritesCountResults = await Promise.all(
        experiences.map((experience) =>
          getExperienceFavoritesCount(experience.id),
        ),
      );

      return {
        experiences: experiences.map((experience, index) => ({
          ...experience,
          commentsCount: commentsCountResults[index] ?? 0,
          attendeesCount: attendeesCountResults[index] ?? 0,
          isAttending: !!userContextResults[index].isAttending,
          tags: tagResults[index],
          isFavorited: !!userContextResults[index].isFavorited,
          favoritesCount: favoritesCountResults[index] ?? 0,
        })),
        nextCursor: experiences.length === limit ? cursor + limit : undefined,
      };
    }),

  byUserId: publicProcedure
    .input(
      z.object({
        id: z.number(),
        cursor: z.number().optional(),
        limit: z.number().optional(),
      }),
    )
    .output(
      z.object({
        experiences: z.array(
          experienceSelectSchema.extend({
            attendeesCount: z.number(),
            commentsCount: z.number(),
            favoritesCount: z.number(),
            isAttending: z.boolean(),
            isFavorited: z.boolean(),
            tags: z.array(tagSelectSchema),
            user: cleanUserSelectSchema,
          }),
        ),
        nextCursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? DEFAULT_EXPERIENCE_LIMIT;
      const cursor = input.cursor ?? 0;

      const experiences = await db.query.experiencesTable.findMany({
        limit,
        offset: cursor,
        where: eq(experiencesTable.userId, input.id),
        orderBy: desc(experiencesTable.createdAt),
        with: {
          user: {
            columns: {
              password: false,
              email: false,
            },
          },
        },
      });

      const commentsCountResults = await Promise.all(
        experiences.map((experience) =>
          getExperienceCommentsCount(experience.id),
        ),
      );

      const attendeesCountResults = await Promise.all(
        experiences.map((experience) =>
          getExperienceAttendeesCount(experience.id),
        ),
      );

      const userContextResults = await Promise.all(
        experiences.map((experience) =>
          getExperienceUserContext(experience.id, ctx.user?.id),
        ),
      );

      const tagResults = await Promise.all(
        experiences.map((experience) => getExperienceTags(experience.id)),
      );

      const favoritesCountResults = await Promise.all(
        experiences.map((experience) =>
          getExperienceFavoritesCount(experience.id),
        ),
      );

      return {
        experiences: experiences.map((experience, index) => ({
          ...experience,
          commentsCount: commentsCountResults[index] ?? 0,
          attendeesCount: attendeesCountResults[index] ?? 0,
          isAttending: !!userContextResults[index].isAttending,
          tags: tagResults[index],
          isFavorited: !!userContextResults[index].isFavorited,
          favoritesCount: favoritesCountResults[index] ?? 0,
        })),
        nextCursor: experiences.length === limit ? cursor + limit : undefined,
      };
    }),

  byTagId: publicProcedure
    .input(
      z.object({
        id: z.number(),
        cursor: z.number().optional(),
        limit: z.number().optional(),
      }),
    )
    .output(
      z.object({
        experiences: z.array(
          experienceSelectSchema.extend({
            attendeesCount: z.number(),
            commentsCount: z.number(),
            favoritesCount: z.number(),
            isAttending: z.boolean(),
            isFavorited: z.boolean(),
            tags: z.array(tagSelectSchema),
            user: cleanUserSelectSchema,
          }),
        ),
        nextCursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? DEFAULT_EXPERIENCE_LIMIT;
      const cursor = input.cursor ?? 0;

      const taggedExperiences = await db
        .select({ experienceId: experienceTagsTable.experienceId })
        .from(experienceTagsTable)
        .where(eq(experienceTagsTable.tagId, input.id));

      const experienceIds = taggedExperiences.map((e) => e.experienceId);

      if (experienceIds.length === 0) {
        return {
          experiences: [],
          nextCursor: undefined,
        };
      }

      const experiences = await db.query.experiencesTable.findMany({
        limit,
        offset: cursor,
        where: inArray(experiencesTable.id, experienceIds),
        orderBy: desc(experiencesTable.createdAt),
        with: {
          user: {
            columns: {
              password: false,
              email: false,
            },
          },
        },
      });

      const commentsCountResults = await Promise.all(
        experiences.map((experience) =>
          getExperienceCommentsCount(experience.id),
        ),
      );

      const attendeesCountResults = await Promise.all(
        experiences.map((experience) =>
          getExperienceAttendeesCount(experience.id),
        ),
      );

      const userContextResults = await Promise.all(
        experiences.map((experience) =>
          getExperienceUserContext(experience.id, ctx.user?.id),
        ),
      );

      const tagResults = await Promise.all(
        experiences.map((experience) => getExperienceTags(experience.id)),
      );

      const favoritesCountResults = await Promise.all(
        experiences.map((experience) =>
          getExperienceFavoritesCount(experience.id),
        ),
      );

      return {
        experiences: experiences.map((experience, index) => ({
          ...experience,
          commentsCount: commentsCountResults[index] ?? 0,
          attendeesCount: attendeesCountResults[index] ?? 0,
          isAttending: !!userContextResults[index].isAttending,
          tags: tagResults[index],
          isFavorited: !!userContextResults[index].isFavorited,
          favoritesCount: favoritesCountResults[index] ?? 0,
        })),
        nextCursor: experiences.length === limit ? cursor + limit : undefined,
      };
    }),

  add: protectedProcedure
    .input(experienceValidationSchema)
    .mutation(async ({ ctx, input }) => {
      let imagePath = null;
      if (input.image) {
        imagePath = await writeFile(input.image);
      }

      return await db
        .insert(experiencesTable)
        .values({
          title: input.title,
          content: input.content,
          scheduledAt: input.scheduledAt,
          url: input.url,
          imageUrl: imagePath,
          location: JSON.stringify(input.location),
          userId: ctx.user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .returning();
    }),

  edit: protectedProcedure
    .input(experienceValidationSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Experience ID is required",
        });
      }

      const experience = await db.query.experiencesTable.findFirst({
        where: eq(experiencesTable.id, input.id),
      });

      if (!experience) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Experience not found",
        });
      }

      if (experience.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own experiences",
        });
      }

      let imagePath = experience.imageUrl;
      if (input.image) {
        imagePath = await writeFile(input.image);
      }

      const experiences = await db
        .update(experiencesTable)
        .set({
          title: input.title,
          content: input.content,
          scheduledAt: input.scheduledAt,
          url: input.url,
          imageUrl: imagePath,
          location: JSON.stringify(input.location),
          updatedAt: new Date().toISOString(),
        })
        .where(eq(experiencesTable.id, input.id))
        .returning();

      return experiences[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: experienceSelectSchema.shape.id }))
    .mutation(async ({ ctx, input }) => {
      const experience = await db.query.experiencesTable.findFirst({
        where: eq(experiencesTable.id, input.id),
      });

      if (!experience) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Experience not found",
        });
      }

      if (experience.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own experiences",
        });
      }

      await db
        .delete(experiencesTable)
        .where(eq(experiencesTable.id, input.id));

      return input.id;
    }),

  attend: protectedProcedure
    .input(z.object({ id: experienceSelectSchema.shape.id }))
    .mutation(async ({ ctx, input }) => {
      const experience = await db.query.experiencesTable.findFirst({
        where: eq(experiencesTable.id, input.id),
      });

      if (!experience) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Experience not found",
        });
      }

      const existingAttendee =
        await db.query.experienceAttendeesTable.findFirst({
          where: and(
            eq(experienceAttendeesTable.experienceId, input.id),
            eq(experienceAttendeesTable.userId, ctx.user.id),
          ),
        });

      if (existingAttendee) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are already attending this experience",
        });
      }

      await db.insert(experienceAttendeesTable).values({
        experienceId: input.id,
        userId: ctx.user.id,
        createdAt: new Date().toISOString(),
      });

      await db.insert(notificationsTable).values({
        type: "user_attending_experience",
        experienceId: input.id,
        fromUserId: ctx.user.id,
        userId: experience.userId,
        createdAt: new Date().toISOString(),
      });

      return { success: true };
    }),

  unattend: protectedProcedure
    .input(z.object({ id: experienceSelectSchema.shape.id }))
    .mutation(async ({ ctx, input }) => {
      const experience = await db.query.experiencesTable.findFirst({
        where: eq(experiencesTable.id, input.id),
      });

      if (!experience) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Experience not found",
        });
      }

      const existingAttendee =
        await db.query.experienceAttendeesTable.findFirst({
          where: and(
            eq(experienceAttendeesTable.experienceId, input.id),
            eq(experienceAttendeesTable.userId, ctx.user.id),
          ),
        });

      if (!existingAttendee) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not attending this experience",
        });
      }

      await db
        .delete(experienceAttendeesTable)
        .where(
          and(
            eq(experienceAttendeesTable.experienceId, input.id),
            eq(experienceAttendeesTable.userId, ctx.user.id),
          ),
        );

      await db.insert(notificationsTable).values({
        type: "user_unattending_experience",
        experienceId: input.id,
        fromUserId: ctx.user.id,
        userId: experience.userId,
        createdAt: new Date().toISOString(),
      });

      return { success: true };
    }),

  kickAttendee: protectedProcedure
    .input(
      z.object({
        experienceId: experienceSelectSchema.shape.id,
        userId: cleanUserSelectSchema.shape.id,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const experience = await db.query.experiencesTable.findFirst({
        where: eq(experiencesTable.id, input.experienceId),
      });

      if (!experience) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Experience not found",
        });
      }

      if (experience.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the experience owner can kick attendees",
        });
      }

      if (experience.userId === input.userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot kick the experience owner",
        });
      }

      await db
        .delete(experienceAttendeesTable)
        .where(
          and(
            eq(experienceAttendeesTable.experienceId, input.experienceId),
            eq(experienceAttendeesTable.userId, input.userId),
          ),
        );

      await db.insert(notificationsTable).values({
        type: "user_kicked_experience",
        experienceId: input.experienceId,
        fromUserId: ctx.user.id,
        userId: input.userId,
        createdAt: new Date().toISOString(),
      });

      return { success: true };
    }),

  favorite: protectedProcedure
    .input(z.object({ id: experienceSelectSchema.shape.id }))
    .mutation(async ({ ctx, input }) => {
      const existingFavorite =
        await db.query.experienceFavoritesTable.findFirst({
          where: and(
            eq(experienceFavoritesTable.experienceId, input.id),
            eq(experienceFavoritesTable.userId, ctx.user.id),
          ),
        });

      if (existingFavorite) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Experience already favorited",
        });
      }

      await db.insert(experienceFavoritesTable).values({
        experienceId: input.id,
        userId: ctx.user.id,
        createdAt: new Date().toISOString(),
      });

      return { success: true };
    }),

  unfavorite: protectedProcedure
    .input(z.object({ id: experienceSelectSchema.shape.id }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(experienceFavoritesTable)
        .where(
          and(
            eq(experienceFavoritesTable.experienceId, input.id),
            eq(experienceFavoritesTable.userId, ctx.user.id),
          ),
        );

      return { success: true };
    }),

  favorites: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        cursor: z.number().optional(),
      }),
    )
    .output(
      z.object({
        experiences: z.array(
          experienceSelectSchema.extend({
            attendeesCount: z.number(),
            commentsCount: z.number(),
            favoritesCount: z.number(),
            isAttending: z.boolean(),
            isFavorited: z.boolean(),
            tags: z.array(tagSelectSchema),
            user: cleanUserSelectSchema,
          }),
        ),
        nextCursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input?.limit ?? DEFAULT_EXPERIENCE_LIMIT;
      const cursor = input?.cursor ?? 0;

      const favorites = await db.query.experienceFavoritesTable.findMany({
        where: eq(experienceFavoritesTable.userId, ctx.user.id),
        limit,
        offset: cursor,
        with: {
          experience: {
            with: {
              user: {
                columns: {
                  password: false,
                  email: false,
                },
              },
            },
          },
        },
      });

      const experiences = favorites.map((f) => f.experience);

      const commentsCountResults = await Promise.all(
        experiences.map((experience) =>
          getExperienceCommentsCount(experience.id),
        ),
      );

      const attendeesCountResults = await Promise.all(
        experiences.map((experience) =>
          getExperienceAttendeesCount(experience.id),
        ),
      );

      const userContextResults = await Promise.all(
        experiences.map((experience) =>
          getExperienceUserContext(experience.id, ctx.user?.id),
        ),
      );

      const tagResults = await Promise.all(
        experiences.map((experience) => getExperienceTags(experience.id)),
      );

      const favoritesCountResults = await Promise.all(
        experiences.map((experience) =>
          getExperienceFavoritesCount(experience.id),
        ),
      );

      return {
        experiences: experiences.map((experience, index) => ({
          ...experience,
          commentsCount: commentsCountResults[index] ?? 0,
          attendeesCount: attendeesCountResults[index] ?? 0,
          isAttending: !!userContextResults[index].isAttending,
          tags: tagResults[index],
          isFavorited: !!userContextResults[index].isFavorited,
          favoritesCount: favoritesCountResults[index] ?? 0,
        })),
        nextCursor: experiences.length === limit ? cursor + limit : undefined,
      };
    }),
});
