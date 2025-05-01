import { User } from "@advanced-react/server/database/schema";

type UserWithHostedExperiences = User & {
  hostedExperiencesCount: number;
};

export type UserForDetails = UserWithHostedExperiences;
