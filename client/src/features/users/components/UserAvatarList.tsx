import { User } from "@advanced-react/server/database/schema";

import Link from "@/features/shared/components/ui/Link";

import { UserAvatar } from "./UserAvatar";

type UserAvatarListProps = {
  users: User[];
  totalCount: number;
  limit?: number;
};

export function UserAvatarList({
  users,
  totalCount,
  limit = 5,
}: UserAvatarListProps) {
  const displayedUsers = users.slice(0, limit);
  const remainingCount = totalCount - limit;

  return (
    <div className="flex flex-wrap gap-2">
      {displayedUsers.map((user) => (
        <Link
          key={user.id}
          to="/users/$userId"
          params={{ userId: user.id }}
          className="hover:opacity-80"
        >
          <UserAvatar user={user} showName={false} />
        </Link>
      ))}
      {remainingCount > 0 && (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-sm font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
          {remainingCount}
        </div>
      )}
    </div>
  );
}
