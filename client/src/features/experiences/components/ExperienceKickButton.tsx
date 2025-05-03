import { Experience, User } from "@advanced-react/server/database/schema";
import { useState } from "react";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Button } from "@/features/shared/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/features/shared/components/ui/Dialog";

import { useExperienceMutations } from "../hooks/useExperienceMutations";

type ExperienceKickButtonProps = {
  experienceId: Experience["id"];
  userId: User["id"];
};

export function ExperienceKickButton({
  experienceId,
  userId,
}: ExperienceKickButtonProps) {
  const { currentUser } = useCurrentUser();

  const [isOpen, setIsOpen] = useState(false);

  const { kickMutation } = useExperienceMutations({
    kick: {
      onSuccess: () => {
        setIsOpen(false);
      },
    },
  });

  if (!currentUser) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive-link">Kick</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kick Attendee</DialogTitle>
        </DialogHeader>
        <p className="text-neutral-600 dark:text-neutral-400">
          Are you sure you want to kick this attendee? This action cannot be
          undone.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => kickMutation.mutate({ experienceId, userId })}
            disabled={kickMutation.isPending}
          >
            {kickMutation.isPending ? "Kicking..." : "Kick"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
