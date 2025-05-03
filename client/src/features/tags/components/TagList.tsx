import { Tag } from "@advanced-react/server/database/schema";

import { TagCard } from "./TagCard";

type TagListProps = {
  tags: Tag[];
};

export default function TagList({ tags }: TagListProps) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <TagCard key={tag.id} tag={tag} />
      ))}
    </div>
  );
}
