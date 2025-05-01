import { relations } from "drizzle-orm";

import {
  commentLikesTable,
  commentsTable,
  experienceAttendeesTable,
  experienceFavoritesTable,
  experiencesTable,
  experienceTagsTable,
  notificationsTable,
  tagsTable,
  userFollowsTable,
  usersTable,
} from "./schema";

export const experiencesRelations = relations(
  experiencesTable,
  ({ many, one }) => ({
    attendees: many(experienceAttendeesTable),
    comments: many(commentsTable),
    notifications: many(notificationsTable),
    tags: many(experienceTagsTable),
    user: one(usersTable, {
      fields: [experiencesTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export const experienceAttendeesRelations = relations(
  experienceAttendeesTable,
  ({ one }) => ({
    experience: one(experiencesTable, {
      fields: [experienceAttendeesTable.experienceId],
      references: [experiencesTable.id],
    }),
    user: one(usersTable, {
      fields: [experienceAttendeesTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export const experienceTagsRelations = relations(
  experienceTagsTable,
  ({ one }) => ({
    experience: one(experiencesTable, {
      fields: [experienceTagsTable.experienceId],
      references: [experiencesTable.id],
    }),
    tag: one(tagsTable, {
      fields: [experienceTagsTable.tagId],
      references: [tagsTable.id],
    }),
  }),
);

export const experienceFavoritesRelations = relations(
  experienceFavoritesTable,
  ({ one }) => ({
    experience: one(experiencesTable, {
      fields: [experienceFavoritesTable.experienceId],
      references: [experiencesTable.id],
    }),
    user: one(usersTable, {
      fields: [experienceFavoritesTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export const commentsRelations = relations(commentsTable, ({ one, many }) => ({
  experience: one(experiencesTable, {
    fields: [commentsTable.experienceId],
    references: [experiencesTable.id],
  }),
  likes: many(commentLikesTable),
  notifications: many(notificationsTable),
  user: one(usersTable, {
    fields: [commentsTable.userId],
    references: [usersTable.id],
  }),
}));

export const commentLikesRelations = relations(
  commentLikesTable,
  ({ one }) => ({
    comment: one(commentsTable, {
      fields: [commentLikesTable.commentId],
      references: [commentsTable.id],
    }),
    user: one(usersTable, {
      fields: [commentLikesTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export const notificationsRelations = relations(
  notificationsTable,
  ({ one }) => ({
    experience: one(experiencesTable, {
      fields: [notificationsTable.experienceId],
      references: [experiencesTable.id],
    }),
    comment: one(commentsTable, {
      fields: [notificationsTable.commentId],
      references: [commentsTable.id],
    }),
    fromUser: one(usersTable, {
      fields: [notificationsTable.fromUserId],
      references: [usersTable.id],
    }),
    user: one(usersTable, {
      fields: [notificationsTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export const tagsRelations = relations(tagsTable, ({ many }) => ({
  experiences: many(experienceTagsTable),
}));

export const userFollowsRelations = relations(userFollowsTable, ({ one }) => ({
  follower: one(usersTable, {
    fields: [userFollowsTable.followerId],
    references: [usersTable.id],
  }),
  following: one(usersTable, {
    fields: [userFollowsTable.followingId],
    references: [usersTable.id],
  }),
}));

export const usersRelations = relations(usersTable, ({ many }) => ({
  experienceFavorites: many(experienceFavoritesTable),
  followers: many(userFollowsTable, { relationName: "following" }),
  following: many(userFollowsTable, { relationName: "follower" }),
  notifications: many(notificationsTable),
  notificationsFrom: many(notificationsTable, {
    relationName: "fromUser",
  }),
}));
