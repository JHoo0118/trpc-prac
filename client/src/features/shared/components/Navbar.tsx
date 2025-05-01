import { Home, Search } from "lucide-react";

import { ThemeToggle } from "./ThemeToggle";
import Link from "./ui/Link";

export default function Navigation() {
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

      <ThemeToggle />
    </nav>
  );
}
