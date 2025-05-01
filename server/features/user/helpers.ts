import { and, count, eq } from "drizzle-orm";

import { db } from "../../database";
import {
  experiencesTable,
  User,
  userFollowsTable,
} from "../../database/schema";

export async function getUserFollowersCount(userId: User["id"]) {
  const [followersCount] = await db
    .select({ count: count() })
    .from(userFollowsTable)
    .where(eq(userFollowsTable.followingId, userId));

  return followersCount?.count ?? 0;
}

export async function getUserFollowingCount(userId: User["id"]) {
  const [followingCount] = await db
    .select({ count: count() })
    .from(userFollowsTable)
    .where(eq(userFollowsTable.followerId, userId));

  return followingCount?.count ?? 0;
}

export async function getUserHostedExperiencesCount(userId: User["id"]) {
  const [hostedExperiencesCount] = await db
    .select({ count: count() })
    .from(experiencesTable)
    .where(eq(experiencesTable.userId, userId));

  return hostedExperiencesCount?.count ?? 0;
}

export async function getUserFollowContext(
  userId: User["id"],
  currentUserId?: User["id"],
) {
  if (!currentUserId) {
    return {
      isFollowing: false,
    };
  }

  const following = await db.query.userFollowsTable.findFirst({
    where: and(
      eq(userFollowsTable.followerId, currentUserId),
      eq(userFollowsTable.followingId, userId),
    ),
  });

  return {
    isFollowing: !!following,
  };
}

export async function getUserFollowers(
  userId: User["id"],
  limit: number,
  offset: number,
) {
  return await db.query.userFollowsTable.findMany({
    where: eq(userFollowsTable.followingId, userId),
    limit,
    offset,
    with: {
      follower: true,
    },
  });
}

export async function getUserFollowing(
  userId: User["id"],
  limit: number,
  offset: number,
) {
  return await db.query.userFollowsTable.findMany({
    where: eq(userFollowsTable.followerId, userId),
    limit,
    offset,
    with: {
      following: true,
    },
  });
}
