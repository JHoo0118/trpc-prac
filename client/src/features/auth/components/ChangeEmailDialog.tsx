import { changeEmailSchema } from "@advanced-react/shared/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { type z } from "zod";

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
import { useToast } from "@/features/shared/hooks/useToast";
import { trpc } from "@/router";

type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;

export function ChangeEmailDialog() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const changeEmailMutation = trpc.auth.changeEmail.useMutation({
    onSuccess: async () => {
      await utils.auth.currentUser.invalidate();

      form.reset();

      setIsOpen(false);

      toast({
        title: "Email changed",
        description: "Your email has been changed",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to change email",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: ChangeEmailFormData) {
    changeEmailMutation.mutate(data);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Update Email</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Email</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      {...field}
                      placeholder="example@email.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} placeholder="********" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={changeEmailMutation.isPending}>
                {changeEmailMutation.isPending ? "Loading..." : "Change Email"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
