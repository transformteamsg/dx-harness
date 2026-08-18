/* CMP-9: a render sink with no allowlisted sanitiser anywhere in the file. This
   is one user's authored content reaching another user's screen through raw HTML,
   which is the whole point of the control. */

export function CommentBody({ comment }: { comment: Comment }) {
  return (
    <div
      className="prose"
      dangerouslySetInnerHTML={{ __html: comment.body }}
    />
  );
}
