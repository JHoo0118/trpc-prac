import { LinkIcon } from "lucide-react";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Button } from "@/features/shared/components/ui/Button";
import Card from "@/features/shared/components/ui/Card";
import Link from "@/features/shared/components/ui/Link";
import { UserAvatarList } from "@/features/users/components/UserAvatarList";
import { router } from "@/router";

import { ExperienceForDetails } from "../types";
import { ExperienceAttendButton } from "./ExperienceAttendButton";
import { ExperienceDeleteDialog } from "./ExperienceDeleteDialog";

type ExperienceDetailsProps = {
  experience: ExperienceForDetails;
};

export function ExperienceDetails({ experience }: ExperienceDetailsProps) {
  return (
    <Card className="p-0">
      <ExperienceDetailsMedia experience={experience} />
      <div className="space-y-4 p-4">
        <ExperienceDetailsHeader experience={experience} />
        <ExperienceDetailsContent experience={experience} />
        <ExperienceDetailsMeta experience={experience} />
        <ExperienceDetailsActionButtons experience={experience} />
        <div className="border-t-2 border-neutral-200 pt-4 dark:border-neutral-800">
          <ExperienceDetailsAttendees experience={experience} />
        </div>
      </div>
    </Card>
  );
}

type ExperienceDetailsMediaProps = Pick<ExperienceDetailsProps, "experience">;

function ExperienceDetailsMedia({ experience }: ExperienceDetailsMediaProps) {
  if (!experience.imageUrl) {
    return null;
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg">
      <img
        src={experience.imageUrl}
        alt={experience.title}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

type ExperienceDetailsHeaderProps = Pick<ExperienceDetailsProps, "experience">;

function ExperienceDetailsHeader({ experience }: ExperienceDetailsHeaderProps) {
  return <h1 className="text-2xl font-bold">{experience.title}</h1>;
}

type ExperienceDetailsContentProps = Pick<ExperienceDetailsProps, "experience">;

function ExperienceDetailsContent({
  experience,
}: ExperienceDetailsContentProps) {
  return (
    <p className="text-lg text-neutral-600 dark:text-neutral-400">
      {experience.content}
    </p>
  );
}

type ExperienceDetailsMetaProps = Pick<ExperienceDetailsProps, "experience">;

function ExperienceDetailsMeta({ experience }: ExperienceDetailsMetaProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        <time className="text-neutral-600 dark:text-neutral-400">
          {new Date(experience.scheduledAt).toLocaleString()}
        </time>
      </div>

      {experience.url && (
        <div className="flex items-center gap-2">
          <LinkIcon
            size={16}
            className="text-secondary-500 dark:text-primary-500"
          />
          <a
            href={experience.url}
            target="_blank"
            className="text-secondary-500 dark:text-primary-500 hover:underline"
          >
            Event Details
          </a>
        </div>
      )}
    </div>
  );
}

type ExperienceDetailsAttendeesProps = Pick<
  ExperienceDetailsProps,
  "experience"
>;

function ExperienceDetailsAttendees({
  experience,
}: ExperienceDetailsAttendeesProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium">Host</h3>
        <UserAvatarList users={[experience.user]} totalCount={1} />
      </div>

      <div className="space-y-2">
        <Link
          to="/experiences/$experienceId/attendees"
          params={{ experienceId: experience.id }}
          variant="secondary"
        >
          <h3 className="font-medium">
            Attendees ({experience.attendeesCount})
          </h3>
        </Link>
        {experience.attendeesCount > 0 ? (
          <UserAvatarList
            users={experience.attendees}
            totalCount={experience.attendeesCount}
          />
        ) : (
          <p className="text-neutral-600 dark:text-neutral-400">
            Be the first to attend!
          </p>
        )}
      </div>
    </div>
  );
}

type ExperienceDetailsActionButtonsProps = Pick<
  ExperienceDetailsProps,
  "experience"
>;

function ExperienceDetailsActionButtons({
  experience,
}: ExperienceDetailsActionButtonsProps) {
  const { currentUser } = useCurrentUser();

  const isPostOwner = currentUser?.id === experience.userId;

  if (isPostOwner) {
    return <ExperienceOwnerButtons experience={experience} />;
  }

  if (currentUser) {
    return (
      <ExperienceAttendButton
        experienceId={experience.id}
        isAttending={experience.isAttending}
      />
    );
  }

  return null;
}

type ExperienceOwnerButtonsProps = Pick<ExperienceDetailsProps, "experience">;

function ExperienceOwnerButtons({ experience }: ExperienceOwnerButtonsProps) {
  return (
    <div className="flex items-center gap-4">
      <Button variant="outline" asChild>
        <Link
          variant="ghost"
          to="/experiences/$experienceId/edit"
          params={{ experienceId: experience.id }}
        >
          Edit
        </Link>
      </Button>
      <ExperienceDeleteDialog
        experience={experience}
        onSuccess={() => {
          router.navigate({ to: "/" });
        }}
      />
    </div>
  );
}
