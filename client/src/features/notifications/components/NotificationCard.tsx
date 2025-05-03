import { LinkProps } from "@tanstack/react-router";

import Card from "@/features/shared/components/ui/Card";
import Link from "@/features/shared/components/ui/Link";
import { useToast } from "@/features/shared/hooks/useToast";
import { trpc } from "@/router";

import { NotificationForList } from "../types";

type NotificationCardProps = {
  notification: NotificationForList;
};

export function NotificationCard({ notification }: NotificationCardProps) {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  let linkProps: Pick<LinkProps, "to" | "params"> | undefined;

  const markAsRead = trpc.notifications.markAsRead.useMutation({
    onMutate: async ({ id }) => {
      await utils.notifications.feed.cancel();
      await utils.notifications.unreadCount.cancel();

      const previousData = {
        feed: utils.notifications.feed.getInfiniteData(),
        unreadCount: utils.notifications.unreadCount.getData(),
      };

      utils.notifications.feed.setInfiniteData({}, (oldData) => {
        if (!oldData) {
          return;
        }

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            notifications: page.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n,
            ),
          })),
        };
      });

      utils.notifications.unreadCount.setData(undefined, (oldData) => {
        if (!oldData) {
          return;
        }

        return Math.max(oldData - 1, 0);
      });

      return { previousData };
    },
    onError: (error, _, context) => {
      utils.notifications.feed.setInfiniteData({}, context?.previousData.feed);

      utils.notifications.unreadCount.setData(
        undefined,
        context?.previousData.unreadCount,
      );

      toast({
        title: "Error marking as read",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (
    [
      "user_commented_experience",
      "user_attending_experience",
      "user_unattending_experience",
    ].includes(notification.type) &&
    notification.experienceId
  ) {
    linkProps = {
      to: "/experiences/$experienceId",
      params: { experienceId: notification.experienceId },
    };
  } else if (notification.type === "user_followed_user") {
    linkProps = {
      to: "/users/$userId",
      params: { userId: notification.fromUserId },
    };
  }

  return (
    <Link
      {...linkProps}
      variant="ghost"
      onClick={() =>
        !notification.read && markAsRead.mutate({ id: notification.id })
      }
    >
      <Card className="flex w-full items-center justify-between gap-2 hover:bg-neutral-50 dark:hover:bg-neutral-800">
        <div>
          <p className="text-gray-800 dark:text-gray-200">
            {notification.content}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(notification.createdAt).toLocaleDateString()}
          </p>
        </div>
        {!notification.read && (
          <div className="h-2 w-2 rounded-full bg-red-500" />
        )}
      </Card>
    </Link>
  );
}
