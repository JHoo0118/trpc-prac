import { Experience } from "@advanced-react/server/database/schema";
import { Heart } from "lucide-react";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Button } from "@/features/shared/components/ui/Button";
import { cn } from "@/lib/utils/cn";

import { useExperienceMutations } from "../hooks/useExperienceMutations";

type ExperienceFavoriteButtonProps = {
  experienceId: Experience["id"];
  isFavorited: boolean;
  favoritesCount: number;
};

export function ExperienceFavoriteButton({
  experienceId,
  isFavorited,
  favoritesCount,
}: ExperienceFavoriteButtonProps) {
  const { currentUser } = useCurrentUser();

  const { favoriteMutation, unfavoriteMutation } = useExperienceMutations();

  if (!currentUser) {
    return null;
  }

  return (
    <Button
      variant="link"
      onClick={() => {
        if (isFavorited) {
          unfavoriteMutation.mutate({ id: experienceId });
        } else {
          favoriteMutation.mutate({ id: experienceId });
        }
      }}
      disabled={favoriteMutation.isPending || unfavoriteMutation.isPending}
    >
      <Heart
        className={cn("h-6 w-6", isFavorited && "fill-red-500 text-red-500")}
      />
      <span>{favoritesCount}</span>
    </Button>
  );
}
