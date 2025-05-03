import { User } from "@advanced-react/server/database/schema";

import Card from "@/features/shared/components/ui/Card";
import Link from "@/features/shared/components/ui/Link";

import { UserAvatar } from "./UserAvatar";

type UserCardProps = {
  user: User;
};

export function UserCard({ user }: UserCardProps) {
  return (
    <Card className="flex items-center justify-between">
      <Link to="/users/$userId" params={{ userId: user.id }}>
        <UserAvatar user={user} />
      </Link>
    </Card>
  );
}
