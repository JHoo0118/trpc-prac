import { Bell, Home, Search, Settings, User } from "lucide-react";

import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { cn } from "@/lib/utils/cn";
import { trpc } from "@/router";

import { ThemeToggle } from "./ThemeToggle";
import Link from "./ui/Link";

export default function Navigation() {
  const { currentUser } = useCurrentUser();
  const unreadCountQuery = trpc.notifications.unreadCount.useQuery(undefined, {
    enabled: !!currentUser,
  });
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
      {currentUser && (
        <Link
          to="/notifications"
          variant="ghost"
          className={cn(
            navLinkClassName,
            "relative flex items-center justify-between gap-2",
          )}
          activeProps={{ className: activeNavLinkClassName }}
        >
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notifications
          </div>
          {unreadCountQuery.data && unreadCountQuery.data > 0 ? (
            <div className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white">
              {unreadCountQuery.data}
            </div>
          ) : undefined}
        </Link>
      )}

      {currentUser && (
        <Link
          to="/users/$userId"
          params={{ userId: currentUser.id }}
          variant="ghost"
          className={navLinkClassName}
          activeProps={{ className: activeNavLinkClassName }}
        >
          <User className="h-6 w-6" />
          Profile
        </Link>
      )}

      {currentUser ? (
        <Link
          to="/settings"
          variant="ghost"
          className={navLinkClassName}
          activeProps={{ className: activeNavLinkClassName }}
        >
          <Settings className="h-6 w-6" />
          Settings
        </Link>
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
