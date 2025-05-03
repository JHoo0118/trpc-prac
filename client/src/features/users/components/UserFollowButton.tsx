import { User } from "@advanced-react/server/database/schema";
import { useParams } from "@tanstack/react-router";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Button } from "@/features/shared/components/ui/Button";
import { useToast } from "@/features/shared/hooks/useToast";
import { trpc } from "@/router";

type UserFollowButtonProps = {
  targetUserId: User["id"];
  isFollowing: boolean;
};

export function UserFollowButton({
  targetUserId,
  isFollowing,
}: UserFollowButtonProps) {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const { currentUser } = useCurrentUser();

  const { userId: pathUserId } = useParams({ strict: false });
  const { experienceId: pathExperienceId } = useParams({ strict: false });

  const followMutation = trpc.users.follow.useMutation({
    onMutate: async ({ id }) => {
      function updateUser<
        T extends { isFollowing: boolean; followersCount: number },
      >(oldData: T) {
        return {
          ...oldData,
          isFollowing: true,
          followersCount: oldData.followersCount + 1,
        };
      }

      await Promise.all([
        utils.users.byId.cancel({ id }),
        ...(pathUserId
          ? [
              utils.users.followers.cancel({ id: pathUserId }),
              utils.users.following.cancel({ id: pathUserId }),
            ]
          : []),
        ...(pathExperienceId
          ? [
              utils.users.experienceAttendees.cancel({
                experienceId: pathExperienceId,
              }),
            ]
          : []),
      ]);

      const previousData = {
        byId: utils.users.byId.getData({ id }),
        ...(pathUserId
          ? {
              followers: utils.users.followers.getInfiniteData({
                id: pathUserId,
              }),
              following: utils.users.following.getInfiniteData({
                id: pathUserId,
              }),
            }
          : {}),
        ...(pathExperienceId
          ? {
              experienceAttendees:
                utils.users.experienceAttendees.getInfiniteData({
                  experienceId: pathExperienceId,
                }),
            }
          : {}),
      };

      utils.users.byId.setData({ id }, (oldData) => {
        if (!oldData) {
          return;
        }

        return updateUser(oldData);
      });

      if (pathUserId) {
        utils.users.followers.setInfiniteData({ id: pathUserId }, (oldData) => {
          if (!oldData) {
            return;
          }

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              items: page.items.map((user) =>
                user.id === id ? updateUser(user) : user,
              ),
            })),
          };
        });

        utils.users.following.setInfiniteData({ id: pathUserId }, (oldData) => {
          if (!oldData) {
            return;
          }

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              items: page.items.map((user) =>
                user.id === id ? updateUser(user) : user,
              ),
            })),
          };
        });
      }

      if (pathExperienceId) {
        utils.users.experienceAttendees.setInfiniteData(
          {
            experienceId: pathExperienceId,
          },
          (oldData) => {
            if (!oldData) {
              return;
            }

            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                attendees: page.attendees.map((user) =>
                  user.id === id ? updateUser(user) : user,
                ),
              })),
            };
          },
        );
      }

      return { previousData };
    },
    onError: (error, { id }, context) => {
      utils.users.byId.setData({ id }, context?.previousData.byId);

      if (pathUserId) {
        utils.users.followers.setInfiniteData(
          { id: pathUserId },
          context?.previousData.followers,
        );

        utils.users.following.setInfiniteData(
          { id: pathUserId },
          context?.previousData.following,
        );
      }

      if (pathExperienceId) {
        utils.users.experienceAttendees.setInfiniteData(
          { experienceId: pathExperienceId },
          context?.previousData.experienceAttendees,
        );
      }

      toast({
        title: "Failed to follow user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unfollowMutation = trpc.users.unfollow.useMutation({
    onMutate: async ({ id }) => {
      function updateUser<
        T extends { isFollowing: boolean; followersCount: number },
      >(oldData: T) {
        return {
          ...oldData,
          isFollowing: false,
          followersCount: Math.max(oldData.followersCount - 1, 0),
        };
      }

      await Promise.all([
        utils.users.byId.cancel({ id }),
        ...(pathUserId
          ? [
              utils.users.followers.cancel({ id: pathUserId }),
              utils.users.following.cancel({ id: pathUserId }),
            ]
          : []),
        ...(pathExperienceId
          ? [
              utils.users.experienceAttendees.cancel({
                experienceId: pathExperienceId,
              }),
            ]
          : []),
      ]);

      const previousData = {
        byId: utils.users.byId.getData({ id }),
        ...(pathUserId
          ? {
              followers: utils.users.followers.getInfiniteData({
                id: pathUserId,
              }),
              following: utils.users.following.getInfiniteData({
                id: pathUserId,
              }),
            }
          : {}),
        ...(pathExperienceId
          ? {
              experienceAttendees:
                utils.users.experienceAttendees.getInfiniteData({
                  experienceId: pathExperienceId,
                }),
            }
          : {}),
      };

      utils.users.byId.setData({ id }, (oldData) => {
        if (!oldData) {
          return;
        }

        return updateUser(oldData);
      });

      if (pathUserId) {
        utils.users.followers.setInfiniteData({ id: pathUserId }, (oldData) => {
          if (!oldData) {
            return;
          }

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              items: page.items.map((user) =>
                user.id === id ? updateUser(user) : user,
              ),
            })),
          };
        });

        utils.users.following.setInfiniteData({ id: pathUserId }, (oldData) => {
          if (!oldData) {
            return;
          }

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              items: page.items.map((user) =>
                user.id === id ? updateUser(user) : user,
              ),
            })),
          };
        });
      }

      if (pathExperienceId) {
        utils.users.experienceAttendees.setInfiniteData(
          {
            experienceId: pathExperienceId,
          },
          (oldData) => {
            if (!oldData) {
              return;
            }

            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                attendees: page.attendees.map((user) =>
                  user.id === id ? updateUser(user) : user,
                ),
              })),
            };
          },
        );
      }

      return { previousData };
    },
    onError: (error, { id }, context) => {
      utils.users.byId.setData({ id }, context?.previousData.byId);

      if (pathUserId) {
        utils.users.followers.setInfiniteData(
          { id: pathUserId },
          context?.previousData.followers,
        );

        utils.users.following.setInfiniteData(
          { id: pathUserId },
          context?.previousData.following,
        );
      }

      if (pathExperienceId) {
        utils.users.experienceAttendees.setInfiniteData(
          { experienceId: pathExperienceId },
          context?.previousData.experienceAttendees,
        );
      }

      toast({
        title: "Failed to follow user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!currentUser || currentUser.id === targetUserId) {
    return null;
  }

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      onClick={(e) => {
        e.preventDefault();

        if (isFollowing) {
          unfollowMutation.mutate({ id: targetUserId });
        } else {
          followMutation.mutate({ id: targetUserId });
        }
      }}
      disabled={followMutation.isPending || unfollowMutation.isPending}
    >
      {isFollowing ? "Unfollow" : "Follow"}
    </Button>
  );
}
