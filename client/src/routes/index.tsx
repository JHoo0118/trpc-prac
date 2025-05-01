import { createFileRoute } from "@tanstack/react-router";

import { ExperienceList } from "@/features/experiences/components/ExperienceList";
import { InfiniteScroll } from "@/features/shared/components/InfiniteScroll";
import { trpc } from "@/router";

export const Route = createFileRoute("/")({
  component: Index,
  loader: async ({ context: { trpcQueryUtils } }) => {
    await trpcQueryUtils.experiences.feed.prefetchInfinite({});
  },
});

function Index() {
  const [{ pages }, experiencesQuery] =
    trpc.experiences.feed.useSuspenseInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );
  return (
    <InfiniteScroll onLoadMore={experiencesQuery.fetchNextPage}>
      <ExperienceList
        experiences={pages.flatMap((page) => page.experiences)}
        isLoading={experiencesQuery.isFetchingNextPage}
      />
    </InfiniteScroll>
  );
}
