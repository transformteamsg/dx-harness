"use client";

import { Children, type KeyboardEvent, type ReactNode, useRef, useState } from "react";

const products = ["Teacher Workspace", "CaseSync", "Glow"] as const;

export function BrandPrincipleTabs({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(0);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectAdjacent = (event: KeyboardEvent<HTMLButtonElement>, next: number) => {
    event.preventDefault();
    setActive(next);
    refs.current[next]?.focus();
  };

  return (
    <div className="mt-8">
      <div className="border-b border-border">
        <div
          role="tablist"
          aria-label="Product brand principles"
          className="flex gap-1 overflow-x-auto"
        >
          {products.map((product, index) => (
            <button
              key={product}
              ref={(element) => {
                refs.current[index] = element;
              }}
              id={`brand-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={active === index}
              aria-controls={`brand-panel-${index}`}
              tabIndex={active === index ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") {
                  selectAdjacent(event, (index + 1) % products.length);
                }
                if (event.key === "ArrowLeft") {
                  selectAdjacent(event, (index - 1 + products.length) % products.length);
                }
                if (event.key === "Home") selectAdjacent(event, 0);
                if (event.key === "End") selectAdjacent(event, products.length - 1);
              }}
              className="min-h-11 shrink-0 border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-tw-blue) aria-selected:border-tw-blue aria-selected:text-foreground"
            >
              {product}
            </button>
          ))}
        </div>
      </div>

      {products.map((product, index) => (
        <div
          key={product}
          id={`brand-panel-${index}`}
          role="tabpanel"
          aria-labelledby={`brand-tab-${index}`}
          tabIndex={active === index ? 0 : -1}
          hidden={active !== index}
        >
          {index === 0 ? (
            Children.only(children)
          ) : (
            <div className="mt-8 rounded-lg border border-border bg-muted/40 p-5">
              <h2 className="font-display text-lg font-semibold">
                {product} principles have not been added yet
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                This product still follows the shared control catalog. Its own brand
                principles should be documented here before teams treat another product&apos;s
                design language as a default.
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
