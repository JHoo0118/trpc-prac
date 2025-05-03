import { createFileRoute, notFound } from "@tanstack/react-router";
import { z } from "zod";

import { ExperienceList } from "@/features/experiences/components/ExperienceList";
import { InfiniteScroll } from "@/features/shared/components/InfiniteScroll";
import { isTRPCClientError, trpc } from "@/router";

export const Route = createFileRoute("/tags/$tagId")({
  params: {
    parse: (params) => ({
      tagId: z.coerce.number().parse(params.tagId),
    }),
  },
  loader: async ({ params, context: { trpcQueryUtils } }) => {
    try {
      await Promise.all([
        trpcQueryUtils.tags.byId.ensureData({ id: params.tagId }),
        trpcQueryUtils.experiences.byTagId.prefetchInfinite({
          id: params.tagId,
        }),
      ]);
    } catch (error) {
      if (isTRPCClientError(error) && error.data?.code === "NOT_FOUND") {
        throw notFound();
      }

      throw error;
    }
  },
  component: TagPage,
});

function TagPage() {
  const { tagId } = Route.useParams();

  const [tag] = trpc.tags.byId.useSuspenseQuery({ id: tagId });

  const [{ pages }, experiencesQuery] =
    trpc.experiences.byTagId.useSuspenseInfiniteQuery(
      {
        id: tagId,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  return (
    <main className="space-y-4">
      <h2 className="text-2xl font-bold">Experiences with "{tag.name}"</h2>
      <InfiniteScroll onLoadMore={experiencesQuery.fetchNextPage}>
        <ExperienceList
          experiences={pages.flatMap((page) => page.experiences)}
          isLoading={experiencesQuery.isFetchingNextPage}
        />
      </InfiniteScroll>
    </main>
  );
}
