/* Tier badge styling, shared by the catalog browser cards and the per-control
   detail page so the badge reads identically on both surfaces. */

export const tierStyles: Record<string, string> = {
  L0: "border-danger-muted bg-danger-subtle text-danger",
  L1: "border-warning-muted bg-warning-subtle text-warning",
  L2: "border-success-muted bg-success-subtle text-success",
};

export const tierLabels: Record<string, string> = {
  L0: "L0 · non-negotiable",
  L1: "L1 · mandatory",
  L2: "L2 · recommended",
};
