/* CMP-9 is L1 and `waiver: documented`, so an inline dx-waive downgrades the
   wording to the [CMP-9][waiver-claimed] form and the run still exits 1. The
   waiver records who approved it; it does not make the finding go away. CMP-2
   has no equivalent here, because it is L0 and never waivable. */

export function CommentBody({ comment }: { comment: Comment }) {
  return (
    // dx-waive CMP-9 reason="mock data only, prototype; resolved before real content"
    <div dangerouslySetInnerHTML={{ __html: comment.body }} />
  );
}
