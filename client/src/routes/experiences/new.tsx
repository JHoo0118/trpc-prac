import { createFileRoute } from "@tanstack/react-router";

import { ExperienceForm } from "@/features/experiences/components/ExperienceForm";
import Card from "@/features/shared/components/ui/Card";
import { router } from "@/router";

export const Route = createFileRoute("/experiences/new")({
  component: ExperienceNewPage,
});

function ExperienceNewPage() {
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">Create Experience</h1>
      <Card>
        <ExperienceForm
          onSuccess={(id) =>
            router.navigate({
              to: "/experiences/$experienceId",
              params: { experienceId: id },
            })
          }
          onCancel={() => router.history.back()}
        />
      </Card>
    </main>
  );
}
