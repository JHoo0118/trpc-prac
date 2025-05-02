import { createFileRoute } from "@tanstack/react-router";

import { LoginForm } from "@/features/auth/components/LoginForm";
import Card from "@/features/shared/components/ui/Card";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <main>
      <Card>
        <LoginForm />
      </Card>
    </main>
  );
}
