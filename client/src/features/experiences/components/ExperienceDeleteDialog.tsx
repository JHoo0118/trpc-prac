import { Experience } from "@advanced-react/server/database/schema";
import { useState } from "react";

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

type ExperienceDeleteDialogProps = {
  experience: Experience;
  onSuccess?: (id: Experience["id"]) => void;
};

export function ExperienceDeleteDialog({
  experience,
  onSuccess,
}: ExperienceDeleteDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { deleteMutation } = useExperienceMutations({
    delete: {
      onSuccess: (id) => {
        setIsOpen(false);
        onSuccess?.(id);
      },
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive-link">Delete</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Experience</DialogTitle>
        </DialogHeader>
        <p className="text-neutral-600 dark:text-neutral-400">
          Are you sure you want to delete this experience? This action cannot be
          undone.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              deleteMutation.mutate({ id: experience.id });
            }}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
