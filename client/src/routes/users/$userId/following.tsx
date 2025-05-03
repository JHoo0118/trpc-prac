import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

import { InfiniteScroll } from "@/features/shared/components/InfiniteScroll";
import { UserFollowButton } from "@/features/users/components/UserFollowButton";
import { UserList } from "@/features/users/components/UserList";
import { isTRPCClientError, trpc } from "@/router";

export const Route = createFileRoute("/users/$userId/following")({
  parseParams: (params) => ({
    userId: z.coerce.number().parse(params.userId),
  }),
  loader: async ({ params, context: { trpcQueryUtils } }) => {
    try {
      await trpcQueryUtils.users.following.prefetchInfinite({
        id: params.userId,
      });
    } catch (error) {
      if (isTRPCClientError(error) && error.data?.code === "NOT_FOUND") {
        throw notFound();
      }
    }
  },
  component: UserFollowingPage,
});

function UserFollowingPage() {
  const { userId } = Route.useParams();

  const [{ pages }, followingQuery] =
    trpc.users.following.useSuspenseInfiniteQuery(
      { id: userId },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  const totalFollowing = pages[0].followingCount;

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">Following ({totalFollowing})</h1>

      <InfiniteScroll onLoadMore={followingQuery.fetchNextPage}>
        <UserList
          users={pages.flatMap((page) => page.items)}
          isLoading={followingQuery.isFetchingNextPage}
          rightComponent={(user) => (
            <UserFollowButton
              targetUserId={user.id}
              isFollowing={user.isFollowing}
            />
          )}
        />
      </InfiniteScroll>
    </main>
  );
}
