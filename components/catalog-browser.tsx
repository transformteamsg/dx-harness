"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import type { Control } from "@/lib/catalog";
import { tierStyles, tierLabels } from "@/lib/tier-style";
import { matchesControl, type CatalogQuery } from "@/lib/catalog-filter";

export function CatalogBrowser({
  controls,
  productNames,
  audienceNames,
}: {
  controls: Control[];
  productNames: Record<string, string>;
  audienceNames: Record<string, string>;
}) {
  const [tier, setTier] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [check, setCheck] = useState<string | null>(null);
  const [product, setProduct] = useState<string | null>(null);
  const [audience, setAudience] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // "/" focuses search from anywhere on the page, unless the user is already
  // typing into another input/textarea/contenteditable.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/") return;
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      const isTyping = tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable;
      if (isTyping) return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(controls.map((c) => c.category))),
    [controls]
  );

  const query = useMemo<CatalogQuery>(
    () => ({ q, tier, category, check, product, audience }),
    [q, tier, category, check, product, audience]
  );

  const filtered = useMemo(
    () => controls.filter((c) => matchesControl(c, query)),
    [controls, query]
  );

  // Faceted counts: for each chip, how many controls would match if that
  // chip's own value replaced whatever is currently selected on its
  // dimension, with every other active filter (including search text) held
  // as-is. Standard faceted-search count semantics.
  const facetCounts = useMemo(() => {
    const countWith = (patch: Partial<CatalogQuery>) =>
      controls.filter((c) => matchesControl(c, { ...query, ...patch })).length;

    const toCounts = (
      values: string[],
      build: (value: string) => Partial<CatalogQuery>
    ): Record<string, number> =>
      Object.fromEntries(values.map((value): [string, number] => [value, countWith(build(value))]));

    return {
      tier: toCounts(["L0", "L1", "L2"], (v) => ({ tier: v })),
      category: toCounts(categories, (v) => ({ category: v })),
      check: toCounts(["deterministic", "judgment", "hybrid"], (v) => ({ check: v })),
      product: toCounts(Object.keys(productNames), (v) => ({ product: v })),
      audience: toCounts(Object.keys(audienceNames), (v) => ({ audience: v })),
    };
  }, [controls, query, categories, productNames, audienceNames]);

  // Grouped-by-category view only when there's no active category chip and
  // no search text — otherwise a flat list of the filtered results.
  const isGrouped = category === null && q === "";

  const copy = (id: string) => {
    navigator.clipboard?.writeText(id);
    setCopied(id);
    setTimeout(() => setCopied(null), 1200);
  };

  const Chip = ({
    active,
    onClick,
    count,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    count?: number;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue) sm:min-h-6 sm:min-w-0",
        active
          ? "border-foreground bg-foreground text-white"
          : "border-border bg-surface text-muted-foreground hover:text-foreground",
        !active && count === 0 && "opacity-50"
      )}
    >
      {children}
      {count !== undefined && <span className="ml-1 tabular-nums">({count})</span>}
    </button>
  );

  // Card markup is unchanged from before this plan — only relocated here (as
  // a plain function, not a nested component) so the flat and grouped views
  // below can share one copy instead of duplicating ~50 lines of JSX.
  const renderCard = (c: Control) => (
    <div
      key={c.id}
      id={c.id}
      className="scroll-mt-20 rounded-lg border border-border bg-surface p-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => copy(c.id)}
          title="Copy control ID"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border bg-accent px-2 py-0.5 text-xs font-semibold hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue) sm:min-h-6 sm:min-w-0"
        >
          {copied === c.id ? "copied ✓" : c.id}
        </button>
        <span
          className={clsx(
            "rounded-full border px-2 py-0.5 text-xs font-medium",
            tierStyles[c.tier]
          )}
        >
          {tierLabels[c.tier]}
        </span>
        <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
          {c.check}
        </span>
        <span className="text-xs text-muted-foreground">{c.category}</span>
        {c.status === "proposed" && (
          <span className="rounded-full border border-warning-muted bg-warning-subtle px-2 py-0.5 text-xs font-medium text-warning">
            Proposed
          </span>
        )}
        {(c.products || c.audiences) && (
          <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
            {[
              ...(c.products ?? []).map((p) => productNames[p] ?? p),
              ...(c.audiences ?? []).map((a) => audienceNames[a] ?? a),
            ].join(" · ")}
          </span>
        )}
        <a
          href={`/standards/catalog/${c.id.toLowerCase()}`}
          className="ml-auto inline-flex min-h-11 items-center text-xs text-tw-blue underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue) sm:min-h-6"
        >
          Details →
        </a>
      </div>
      <p className="mt-2 text-base font-medium">{c.statement}</p>
      {c.fails_when && (
        <p className="mt-1.5 text-sm text-muted-foreground">
          <span className="font-semibold text-danger">Fails when:</span>{" "}
          {c.fails_when.join(" · ")}
        </p>
      )}
    </div>
  );

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2">
        <input
          ref={searchRef}
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search controls — id, rule, fail condition"
          aria-label="Search controls"
          className="min-h-11 w-full max-w-[360px] rounded-md border border-border bg-surface px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue) sm:min-h-8"
        />
        <kbd className="rounded border border-border bg-muted px-1.5 text-xs text-muted-foreground">
          /
        </kbd>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {["L0", "L1", "L2"].map((t) => (
          <Chip
            key={t}
            active={tier === t}
            onClick={() => setTier(tier === t ? null : t)}
            count={facetCounts.tier[t]}
          >
            {t}
          </Chip>
        ))}
        <span aria-hidden className="mx-1 hidden text-border sm:inline">|</span>
        {categories.map((c) => (
          <Chip
            key={c}
            active={category === c}
            onClick={() => setCategory(category === c ? null : c)}
            count={facetCounts.category[c]}
          >
            {c}
          </Chip>
        ))}
        <span aria-hidden className="mx-1 hidden text-border sm:inline">|</span>
        {["deterministic", "judgment", "hybrid"].map((k) => (
          <Chip
            key={k}
            active={check === k}
            onClick={() => setCheck(check === k ? null : k)}
            count={facetCounts.check[k]}
          >
            {k}
          </Chip>
        ))}
        <span aria-hidden className="mx-1 hidden text-border sm:inline">|</span>
        {Object.entries(productNames).map(([key, name]) => (
          <Chip
            key={key}
            active={product === key}
            onClick={() => setProduct(product === key ? null : key)}
            count={facetCounts.product[key]}
          >
            {name}
          </Chip>
        ))}
        <span aria-hidden className="mx-1 hidden text-border sm:inline">|</span>
        {Object.entries(audienceNames).map(([key, name]) => (
          <Chip
            key={key}
            active={audience === key}
            onClick={() => setAudience(audience === key ? null : key)}
            count={facetCounts.audience[key]}
          >
            {name}
          </Chip>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        {filtered.length} of {controls.length} controls
      </p>

      {isGrouped ? (
        <div className="mt-3 flex flex-col gap-6">
          {categories.map((cat) => {
            const inCategory = filtered.filter((c) => c.category === cat);
            if (inCategory.length === 0) return null;
            return (
              <div key={cat}>
                <h3 className="text-xs font-semibold text-muted-foreground">
                  {cat} ({inCategory.length})
                </h3>
                <div className="mt-2 flex flex-col gap-3">{inCategory.map(renderCard)}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-3">{filtered.map(renderCard)}</div>
      )}
    </div>
  );
}
