import {
  Comment,
  Experience,
  User,
} from "@advanced-react/server/database/schema";

type CommentWithUser = Comment & {
  user: User;
};

type CommentWithUserContext = Comment & {
  isLiked: boolean;
};

type CommentWithLikesCount = Comment & {
  likesCount: number;
};

type CommentWithExperience = Comment & {
  experience: Experience;
};

export type CommentForList = CommentWithUser &
  CommentWithExperience &
  CommentWithUserContext &
  CommentWithLikesCount;

export type CommentOptimistic = CommentWithUser &
  CommentWithExperience &
  CommentWithUserContext &
  CommentWithLikesCount & {
    optimistic: true;
  };
