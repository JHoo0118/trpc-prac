import { User } from "@advanced-react/server/database/schema";

type UserWithFollowCounts = User & {
  followersCount: number;
  followingCount: number;
};

type UserWithHostedExperiences = User & {
  hostedExperiencesCount: number;
};

export type UserWithUserContext = User & {
  isFollowing: boolean;
};

export type UserForList = User & UserWithUserContext;

export type UserForDetails = UserWithFollowCounts &
  UserWithHostedExperiences &
  UserWithUserContext;
