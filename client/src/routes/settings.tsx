import { createFileRoute, redirect } from "@tanstack/react-router";

import { ChangeEmailDialog } from "@/features/auth/components/ChangeEmailDialog";
import { ChangePasswordDialog } from "@/features/auth/components/ChangePasswordDialog";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Button } from "@/features/shared/components/ui/Button";
import Card from "@/features/shared/components/ui/Card";
import { useToast } from "@/features/shared/hooks/useToast";
import { router, trpc } from "@/router";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  loader: async ({ context: { trpcQueryUtils } }) => {
    const { currentUser } = await trpcQueryUtils.auth.currentUser.ensureData();

    if (!currentUser) {
      return redirect({ to: "/login" });
    }
  },
});

function SettingsPage() {
  const utils = trpc.useUtils();
  const { toast } = useToast();
  const { currentUser } = useCurrentUser();

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.auth.currentUser.invalidate();

      router.navigate({ to: "/login" });

      toast({
        title: "Logged out",
        description: "You have been logged out",
      });
    },
    onError: (error) => {
      toast({
        title: "Error logging out",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const settings = [
    {
      label: currentUser?.email,
      component: <ChangeEmailDialog />,
    },
    {
      label: "Change password",
      component: <ChangePasswordDialog />,
    },
    {
      label: "Sign out of your account",
      component: (
        <Button
          variant="destructive"
          disabled={logoutMutation.isPending}
          onClick={() => logoutMutation.mutate()}
        >
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </Button>
      ),
    },
  ];

  return (
    <main className="space-y-4">
      {settings.map((setting) => (
        <Card key={setting.label} className="flex items-center justify-between">
          <span className="text-neutral-600 dark:text-neutral-400">
            {setting.label}
          </span>
          {setting.component}
        </Card>
      ))}
    </main>
  );
}
