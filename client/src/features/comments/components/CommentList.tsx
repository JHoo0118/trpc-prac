import Spinner from "@/features/shared/components/ui/Spinner";

import { CommentForList } from "../types";
import { CommentCard } from "./CommentCard";

type CommentListProps = {
  comments: CommentForList[];
  isLoading: boolean;
  noCommentsMessage?: string;
};

export default function CommentList({
  comments,
  isLoading,
  noCommentsMessage = "No comments yet",
}: CommentListProps) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentCard key={comment.id} comment={comment} />
      ))}
      {isLoading && (
        <div className="flex justify-center">
          <Spinner />
        </div>
      )}
      {!isLoading && comments.length === 0 && (
        <div className="flex justify-center">{noCommentsMessage}</div>
      )}
    </div>
  );
}
