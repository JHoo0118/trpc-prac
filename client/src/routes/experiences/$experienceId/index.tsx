import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { CommentsSection } from "@/features/comments/components/CommentsSection";
import { ExperienceDetails } from "@/features/experiences/components/ExperienceDetails";
import { trpc } from "@/router";

export const Route = createFileRoute("/experiences/$experienceId/")({
  params: {
    parse: (params) => ({
      experienceId: z.coerce.number().parse(params.experienceId),
    }),
  },
  loader: async ({ params, context: { trpcQueryUtils } }) => {
    await trpcQueryUtils.experiences.byId.ensureData({
      id: params.experienceId,
    });
  },
  component: ExperiencePage,
});

function ExperiencePage() {
  const { experienceId } = Route.useParams();

  const [experience] = trpc.experiences.byId.useSuspenseQuery({
    id: experienceId,
  });

  return (
    <main className="space-y-4 pb-20">
      <ExperienceDetails experience={experience} />
      <CommentsSection
        experienceId={experienceId}
        commentsCount={experience.commentsCount}
      />
    </main>
  );
}
