import { User } from "@advanced-react/server/database/schema";

type UserWithFollowCounts = User & {
  followersCount: number;
  followingCount: number;
};

type UserWithHostedExperiences = User & {
  hostedExperiencesCount: number;
};

export type UserForList = User;

export type UserForDetails = UserWithFollowCounts & UserWithHostedExperiences;
