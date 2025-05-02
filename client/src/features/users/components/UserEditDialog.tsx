import { User } from "@advanced-react/server/database/schema";
import { userEditSchema } from "@advanced-react/shared/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/features/shared/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/features/shared/components/ui/Dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/features/shared/components/ui/Form";
import Input from "@/features/shared/components/ui/Input";
import { TextArea } from "@/features/shared/components/ui/TextArea";
import { useToast } from "@/features/shared/hooks/useToast";
import { trpc, trpcQueryUtils } from "@/router";

type UserFormData = z.infer<typeof userEditSchema>;

type UserEditDialogProps = {
  user: User;
};

export function UserEditDialog({ user }: UserEditDialogProps) {
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      id: user.id,
      name: user.name,
      bio: user.bio ?? "",
    },
  });

  const editUserMutation = trpc.users.edit.useMutation({
    onSuccess: async ({ id }) => {
      await Promise.all([
        trpcQueryUtils.users.byId.invalidate({ id }),
        trpcQueryUtils.auth.currentUser.invalidate(),
      ]);

      setIsOpen(false);

      toast({
        title: "Profile updated",
        description: "Your profile has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to edit user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    const formData = new FormData();

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        formData.append(key, value as string | Blob);
      }
    }

    editUserMutation.mutate(formData);
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Edit Profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <TextArea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={editUserMutation.isPending}>
                {editUserMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
