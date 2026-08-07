import Link from "next/link";
import { getDoc } from "@/lib/content";
import { Illo } from "@/components/illo";
import { Parallax, Reveal } from "@/components/landing-motion";
import { Readers, type Reader } from "@/components/readers";
import { OrbitLoop } from "@/components/diagrams/orbit-loop";

export const metadata = {
  alternates: { types: { "text/markdown": "/index.md" } },
};

type WhyItem = { title: string; text: string };
type TeamMember = { name: string; role: string; focus: string };

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function Landing() {
  const doc = getDoc("sections", "landing");
  if (!doc) return null;
  const why = (doc.data.why ?? []) as WhyItem[];
  const team = (doc.data.team ?? []) as TeamMember[];
  const readers = (doc.data.readers ?? []) as Reader[];
  const cta = (doc.data.cta as string) ?? "See the TFX Design Standard";

  return (
    <div className="mx-auto max-w-[880px]">
      <section className="pt-10 sm:pt-16">
        <p className="text-xs font-semibold text-tw-blue">
          TransformX · Teacher &amp; School portfolio
        </p>
        <h1 className="mt-4 max-w-[16ch] font-display text-5xl font-semibold tracking-tight sm:text-7xl">
          {doc.title}
        </h1>
        <p className="mt-6 max-w-[58ch] text-lg text-muted-foreground">
          {doc.description}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <Link
            href="/overview"
            className="rounded-lg bg-tw-blue px-5 py-3 text-base font-semibold text-white transition-colors duration-150 hover:bg-tw-blue-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
          >
            {cta}
          </Link>
          <Link
            href="/for-agents"
            className="text-sm font-medium text-muted-foreground underline underline-offset-2 hover:text-foreground"
          >
            Building with an AI agent?
          </Link>
        </div>
      </section>

      <Reveal className="mt-14">
        <OrbitLoop />
        <p className="mt-3 text-sm text-muted-foreground">
          The design loop, live — two human gates, intent without loss.{" "}
          <Link href="/harness/loop" className="text-tw-blue underline underline-offset-2">
            How the loop works
          </Link>
        </p>
      </Reveal>

      {doc.illustration && (
        <Parallax drift={14}>
          <Illo subject={doc.illustration} />
        </Parallax>
      )}

      {readers.length > 0 && (
        <Readers
          heading={(doc.data.readersHeading as string) ?? "One standard, three readers"}
          lead={(doc.data.readersLead as string) ?? ""}
          readers={readers}
        />
      )}

      <section className="mt-16">
        <Reveal>
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Why a standard, not a style guide
          </h2>
        </Reveal>
        <div className="mt-2">
          {why.map((item, i) => (
            <Reveal
              key={item.title}
              delay={i * 80}
              className="border-b border-border last:border-b-0"
            >
              <div className="grid gap-2 py-7 sm:grid-cols-[88px_1fr] sm:gap-6">
                <p className="font-display text-2xl font-semibold text-tw-blue">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <div>
                  <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 max-w-[62ch] text-base text-muted-foreground">
                    {item.text}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-xl bg-tw-blue px-8 py-10 text-white sm:px-12">
        <p className="text-xs font-semibold text-white">
          The one test
        </p>
        <p className="mt-3 max-w-[24ch] font-display text-2xl font-semibold leading-snug sm:text-3xl">
          Does this help teachers work faster with less stress?
        </p>
        <p className="mt-3 text-base text-white">If not, we don&apos;t build it.</p>
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          The designers behind it
        </h2>
        <p className="mt-2 max-w-[60ch] text-base text-muted-foreground">
          The TransformX product design team writes, argues over, and maintains this standard.
        </p>
        <div className="mt-8 grid gap-x-6 gap-y-8 sm:grid-cols-3">
          {team.map((m, i) => (
            <div key={`${m.name}-${i}`}>
              <span
                className="grid h-14 w-14 place-items-center rounded-full text-base font-semibold text-tw-blue"
                style={{ background: "color-mix(in oklab, var(--tw-blue) 10%, var(--surface))" }}
                aria-hidden="true"
              >
                {initials(m.name)}
              </span>
              <p className="mt-3 text-base font-semibold">{m.name}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{m.role}</p>
              <p className="mt-1 text-xs text-muted-foreground">{m.focus}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6 mt-16 border-t border-border pt-12 text-center">
        <h2 className="mx-auto max-w-[26ch] font-display text-2xl font-semibold tracking-tight">
          Principles, controls, and a harness, in one place.
        </h2>
        <div className="mt-6">
          <Link
            href="/overview"
            className="inline-block rounded-lg bg-tw-blue px-5 py-3 text-base font-semibold text-white transition-colors duration-150 hover:bg-tw-blue-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue)"
          >
            {cta}
          </Link>
        </div>
      </section>
    </div>
  );
}
