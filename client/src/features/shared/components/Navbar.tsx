import { Home, Search, User } from "lucide-react";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

import { ThemeToggle } from "./ThemeToggle";
import Link from "./ui/Link";

export default function Navigation() {
  const { currentUser } = useCurrentUser();

  const navLinkClassName =
    "rounded-lg p-2 text-lg hover:bg-neutral-100 dark:hover:bg-neutral-800";

  const activeNavLinkClassName = "bg-neutral-100 dark:bg-neutral-800";

  return (
    <nav className="flex w-64 flex-col gap-4 pt-8">
      <Link
        to="/"
        variant="ghost"
        className={navLinkClassName}
        activeProps={{ className: activeNavLinkClassName }}
      >
        <Home className="h-6 w-6" />
        Home
      </Link>
      <Link
        to="/search"
        variant="ghost"
        className={navLinkClassName}
        activeProps={{ className: activeNavLinkClassName }}
      >
        <Search className="h-6 w-6" />
        Search
      </Link>

      {currentUser ? (
        <div>Signed In</div>
      ) : (
        <Link
          to="/login"
          variant="ghost"
          className={navLinkClassName}
          activeProps={{ className: activeNavLinkClassName }}
        >
          <User className="h-6 w-6" />
          Sign in
        </Link>
      )}

      <ThemeToggle />
    </nav>
  );
}
