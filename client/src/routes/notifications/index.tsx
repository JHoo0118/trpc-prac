import { createFileRoute, redirect } from "@tanstack/react-router";

import NotificationList from "@/features/notifications/components/NotificationList";
import { InfiniteScroll } from "@/features/shared/components/InfiniteScroll";
import { trpc } from "@/router";

export const Route = createFileRoute("/notifications/")({
  loader: async ({ context: { trpcQueryUtils } }) => {
    const { currentUser } = await trpcQueryUtils.auth.currentUser.ensureData();

    if (!currentUser) {
      return redirect({ to: "/login" });
    }

    await trpcQueryUtils.notifications.feed.prefetchInfinite({});
  },
  component: NotificationsPage,
});

function NotificationsPage() {
  const [{ pages }, notificationsQuery] =
    trpc.notifications.feed.useSuspenseInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  return (
    <main className="space-y-4">
      <InfiniteScroll onLoadMore={notificationsQuery.fetchNextPage}>
        <NotificationList
          notifications={pages.flatMap((page) => page.notifications)}
          isLoading={notificationsQuery.isFetchingNextPage}
        />
      </InfiniteScroll>
    </main>
  );
}
