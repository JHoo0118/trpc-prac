import { and, count, eq } from "drizzle-orm";

import { db } from "../../database";
import {
  commentsTable,
  Experience,
  experienceAttendeesTable,
  experienceFavoritesTable,
  experienceTagsTable,
  User,
} from "../../database/schema";

export async function getExperienceCommentsCount(
  experienceId: Experience["id"],
) {
  const [commentsCount] = await db
    .select({ count: count() })
    .from(commentsTable)
    .where(eq(commentsTable.experienceId, experienceId));

  return commentsCount?.count ?? 0;
}

export async function getExperienceAttendeesCount(
  experienceId: Experience["id"],
) {
  const [attendeesCount] = await db
    .select({ count: count() })
    .from(experienceAttendeesTable)
    .where(eq(experienceAttendeesTable.experienceId, experienceId));

  return attendeesCount?.count ?? 0;
}

export async function getExperienceFavoritesCount(
  experienceId: Experience["id"],
) {
  const [favoritesCount] = await db
    .select({ count: count() })
    .from(experienceFavoritesTable)
    .where(eq(experienceFavoritesTable.experienceId, experienceId));

  return favoritesCount?.count ?? 0;
}

export async function getExperienceUserContext(
  experienceId: Experience["id"],
  userId?: User["id"],
) {
  if (!userId) {
    return {
      isAttending: false,
      isFavorited: false,
    };
  }

  const [attendance, favorite] = await Promise.all([
    db.query.experienceAttendeesTable.findFirst({
      where: and(
        eq(experienceAttendeesTable.experienceId, experienceId),
        eq(experienceAttendeesTable.userId, userId),
      ),
    }),
    db.query.experienceFavoritesTable.findFirst({
      where: and(
        eq(experienceFavoritesTable.experienceId, experienceId),
        eq(experienceFavoritesTable.userId, userId),
      ),
    }),
  ]);

  return {
    isAttending: !!attendance,
    isFavorited: !!favorite,
  };
}

export async function getExperienceAttendees(experienceId: Experience["id"]) {
  const attendees = await db.query.experienceAttendeesTable.findMany({
    where: eq(experienceAttendeesTable.experienceId, experienceId),
    limit: 5,
    with: {
      user: {
        columns: {
          email: false,
          password: false,
        },
      },
    },
  });

  return attendees.map((a) => a.user);
}

export async function getExperienceTags(experienceId: Experience["id"]) {
  const experienceTags = await db.query.experienceTagsTable.findMany({
    where: eq(experienceTagsTable.experienceId, experienceId),
    with: {
      tag: true,
    },
  });

  return experienceTags.map((et) => et.tag);
}
