import Spinner from "@/features/shared/components/ui/Spinner";

import { UserForList, UserWithUserContext } from "../types";
import { UserCard } from "./UserCard";

type UserListProps = {
  users: UserForList[];
  isLoading?: boolean;
  rightComponent?: (user: UserWithUserContext) => React.ReactNode;
};

export function UserList({ users, isLoading, rightComponent }: UserListProps) {
  return (
    <div className="flex flex-col gap-4">
      {users.map((user) => (
        <UserCard key={user.id} user={user} rightComponent={rightComponent} />
      ))}
      {isLoading && (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      )}
      {!isLoading && users.length === 0 && (
        <div className="flex justify-center py-4">
          <p>No users found</p>
        </div>
      )}
    </div>
  );
}
