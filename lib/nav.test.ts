import { describe, expect, it } from "vitest";
import { isVisibleNavHref, readingOrder, visibleNav } from "./nav";

describe("docs navigation", () => {
  it("opens Standards directly on the combined control catalog", () => {
    expect(isVisibleNavHref("/standards/catalog")).toBe(true);
    expect(readingOrder.some((page) => page.href === "/standards")).toBe(false);
  });

  it("keeps product profiles and the designer on-ramp out of primary navigation", () => {
    expect(visibleNav.some((group) => group.label === "Products")).toBe(false);
    expect(isVisibleNavHref("/harness/on-ramp")).toBe(false);
    expect(readingOrder.some((page) => page.href.startsWith("/products"))).toBe(false);
    expect(readingOrder.some((page) => page.href === "/harness/on-ramp")).toBe(false);
  });

  it("orders the visible harness pages around the core workflow", () => {
    const harness = visibleNav.find((group) => group.label === "Harness");
    expect(harness?.href).toBe("/overview");
    expect(harness?.items).toEqual([
      { href: "/harness/install", title: "Quick start" },
      { href: "/harness/skills", title: "Skills" },
      { href: "/harness/loop", title: "The loop" },
      { href: "/harness/tools", title: "Tools" },
      { href: "/harness/research-brief", title: "Research brief" },
    ]);
  });

  it("names the code workflow Design in Code", () => {
    expect(visibleNav.some((group) => group.label === "Design in Code")).toBe(true);
    expect(visibleNav.some((group) => group.label === "Start with code")).toBe(false);
  });
});
