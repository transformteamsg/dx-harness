/* Placeholder slot for Midjourney illustration. The illustration guideline is
   strict: Midjourney with the brand SREF only, no hand-coded fallback art —
   so the slot stays empty and hands you the exact prompt to run. It's a quiet,
   collapsed disclosure by default: a flagship page reads finished, and an
   author expands it to get the aspect box and the prompt. Native
   <details>/<summary> carries the keyboard + ARIA affordance for free. */

const SREF = "--sref 2544305963::2 4104856457";

function aspectOf(subject: string): string {
  const ar = subject.match(/--ar (\d+):(\d+)/);
  return ar ? `${ar[1]} / ${ar[2]}` : "8 / 5";
}

export function Illo({ subject }: { subject: string }) {
  return (
    <details className="group my-8 rounded-lg border border-dashed border-border bg-surface">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue) [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden="true"
          className="transition-transform duration-(--motion-fast) group-open:rotate-90"
        >
          ›
        </span>
        Illustration slot — select for the generation prompt
      </summary>
      <div className="border-t border-dashed border-border p-4">
        <div
          className="grid place-items-center rounded-md bg-muted"
          style={{ aspectRatio: aspectOf(subject) }}
        >
          <p className="max-w-[44ch] px-6 text-center text-sm leading-normal text-muted-foreground">
            Generate with the prompt below, regenerate if off-brand, then place
            the approved file from the library here.
          </p>
        </div>
        <code className="mt-2.5 block select-all rounded-md border border-border bg-surface px-3.5 py-2.5 text-xs leading-normal text-muted-foreground">
          {subject} {SREF}
        </code>
      </div>
    </details>
  );
}
