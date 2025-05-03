import { CommentForList } from "../types";
import { CommentCard } from "./CommentCard";

type CommentListProps = {
  comments: CommentForList[];
  noCommentsMessage?: string;
};

export default function CommentList({
  comments,
  noCommentsMessage = "No comments yet",
}: CommentListProps) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentCard key={comment.id} comment={comment} />
      ))}

      {comments.length === 0 && (
        <div className="flex justify-center">{noCommentsMessage}</div>
      )}
    </div>
  );
}
