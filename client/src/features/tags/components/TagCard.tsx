import { Tag } from "@advanced-react/server/database/schema";

import { Badge } from "@/features/shared/components/ui/Badge";
import Link from "@/features/shared/components/ui/Link";

type TagCardProps = {
  tag: Tag;
};

export function TagCard({ tag }: TagCardProps) {
  return (
    <Badge>
      <Link to="/tags/$tagId" params={{ tagId: tag.id }} variant="ghost">
        {tag.name}
      </Link>
    </Badge>
  );
}
