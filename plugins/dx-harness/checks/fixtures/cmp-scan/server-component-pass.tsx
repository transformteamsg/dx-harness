/* CMP-3's two narrowings, both of which this file needs to stay clean. It holds
   an `await` and no `catch`, which is the shape 8 of this repo's own Next.js
   server components and route handlers have. It is not a client file, so CMP-3
   is out of scope for it, and its notFound() is a framework error path anyway.
   Either narrowing alone takes it to zero; both ship. */

export default async function Page({ params }: { params: { slug: string } }) {
  const doc = await loadDoc(params.slug);
  if (!doc) notFound();

  return (
    <article>
      <h1>{doc.title}</h1>
      {doc.body}
    </article>
  );
}
