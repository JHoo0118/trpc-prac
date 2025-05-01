import Spinner from "@/features/shared/components/ui/Spinner";

import { ExperienceForList } from "../types";
import { ExperienceCard } from "./ExperienceCard";

type ExperienceListProps = {
  experiences: ExperienceForList[];
  isLoading?: boolean;
  noExperiencesMessage?: string;
};

export function ExperienceList({
  experiences,
  isLoading,
  noExperiencesMessage = "No experiences found",
}: ExperienceListProps) {
  return (
    <div className="space-y-4">
      {experiences.map((experience) => (
        <ExperienceCard key={experience.id} experience={experience} />
      ))}
      {isLoading && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}
      {!isLoading && experiences.length === 0 && (
        <div className="flex justify-center">{noExperiencesMessage}</div>
      )}
    </div>
  );
}
