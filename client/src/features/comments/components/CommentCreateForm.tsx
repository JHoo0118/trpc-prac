import { Experience } from "@advanced-react/server/database/schema";
import { commentValidationSchema } from "@advanced-react/shared/schema/comment";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Button } from "@/features/shared/components/ui/Button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/features/shared/components/ui/Form";
import { TextArea } from "@/features/shared/components/ui/TextArea";
import { useToast } from "@/features/shared/hooks/useToast";
import { trpc } from "@/router";

import { CommentOptimistic } from "../types";

type CommentCreateFormData = z.infer<typeof commentValidationSchema>;

type CommentCreateFormProps = {
  experience: Experience;
};

export function CommentCreateForm({ experience }: CommentCreateFormProps) {
  const { toast } = useToast();
  const utils = trpc.useUtils();
  const { currentUser } = useCurrentUser();

  const form = useForm<CommentCreateFormData>({
    resolver: zodResolver(commentValidationSchema),
    defaultValues: {
      content: "",
    },
  });

  const addCommentMutation = trpc.comments.add.useMutation({
    onMutate: async ({ content, experienceId }) => {
      if (!currentUser) {
        return;
      }

      form.reset();

      await Promise.all([
        utils.comments.byExperienceId.cancel({
          experienceId,
        }),
        utils.experiences.byId.cancel({
          id: experienceId,
        }),
      ]);

      const previousData = {
        byExperienceId: utils.comments.byExperienceId.getData({
          experienceId,
        }),
        experienceById: utils.experiences.byId.getData({ id: experienceId }),
      };

      const optimisticComment: CommentOptimistic = {
        id: Math.random(),
        optimistic: true,
        content: content,
        experienceId,
        experience,
        userId: currentUser.id,
        user: currentUser,
        isLiked: false,
        likesCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      utils.comments.byExperienceId.setData(
        { experienceId: experience.id },
        (oldData) => {
          if (!oldData) {
            return;
          }

          return [optimisticComment, ...oldData];
        },
      );

      utils.experiences.byId.setData({ id: experience.id }, (oldData) => {
        if (!oldData) {
          return;
        }

        return {
          ...oldData,
          commentsCount: oldData.commentsCount + 1,
        };
      });

      const { dismiss } = toast({
        title: "Comment added",
        description: "Your comment has been added",
      });

      return { dismiss, previousData };
    },
    onSuccess: async ({ experienceId }) => {
      await utils.comments.byExperienceId.invalidate({
        experienceId,
      });
    },
    onError: (error, { experienceId }, context) => {
      context?.dismiss?.();

      utils.comments.byExperienceId.setData(
        { experienceId },
        context?.previousData.byExperienceId,
      );

      utils.experiences.byId.setData(
        { id: experienceId },
        context?.previousData.experienceById,
      );

      toast({
        title: "Failed to add comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    addCommentMutation.mutate({
      content: data.content,
      experienceId: experience.id,
    });
  });
  if (!currentUser) {
    return (
      <div className="text-center text-neutral-500">
        Please log in to add comments
      </div>
    );
  }
  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <TextArea {...field} placeholder="Add a comment..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={addCommentMutation.isPending}>
          Add Comment
        </Button>
      </form>
    </Form>
  );
}
