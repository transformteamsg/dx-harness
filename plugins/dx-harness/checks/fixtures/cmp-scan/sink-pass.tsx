/* CMP-9: the same sink with an allowlisted sanitiser in the file. A sanitiser
   downgrades the finding to a NOTE asking the reviewer to confirm the sanitiser
   sits at the render boundary; it never suppresses it, so this file still prints
   a line. It just prints no ERROR. */

import DOMPurify from "dompurify";

export function CommentBody({ comment }: { comment: Comment }) {
  return (
    <div
      className="prose"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(comment.body) }}
    />
  );
}
