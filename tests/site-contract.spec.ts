import { expect, test, type Locator, type Page } from "@playwright/test";

const routes = [
  { name: "landing", path: "/" },
  { name: "overview", path: "/overview" },
  { name: "how to read", path: "/how-to-read" },
  { name: "standards catalog", path: "/standards/catalog" },
  { name: "for agents", path: "/for-agents" },
  { name: "the loop", path: "/harness/loop" },
  { name: "standards redirect", path: "/standards" },
  { name: "motion foundations", path: "/foundations/motion" },
  { name: "tokens foundations", path: "/foundations/tokens" },
  { name: "governance changes", path: "/governance/changes" },
] as const;

test("standards overview resolves directly to the combined control catalog", async ({ page }) => {
  await page.goto("/standards");
  await expect(page).toHaveURL(/\/standards\/catalog$/);
  await expect(page.getByRole("heading", { name: "Standards", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Control catalog", exact: true })).toBeVisible();
  await expect(page.getByText("See what the catalog catches")).toHaveCount(0);
});

const mobileWidths = [320, 360] as const;

async function open(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator("main#main-content")).toBeVisible();
}

async function expectMinimumTarget(locator: Locator, minimum: number) {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();

  expect(box, "target should have a measurable bounding box").not.toBeNull();
  expect(box!.width, "target width").toBeGreaterThanOrEqual(minimum);
  expect(box!.height, "target height").toBeGreaterThanOrEqual(minimum);
}

test.describe("rendered route contract", () => {
  for (const route of routes) {
    test(`${route.name} has exactly one main landmark`, async ({ page }) => {
      await open(page, route.path);
      await expect(page.getByRole("main")).toHaveCount(1);
    });

    for (const width of mobileWidths) {
      test(`${route.name} has no document overflow at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await open(page, route.path);

        const dimensions = await page.evaluate(() => ({
          body: document.body.scrollWidth,
          document: document.documentElement.scrollWidth,
          viewport: document.documentElement.clientWidth,
        }));

        expect(dimensions.document, "document scroll width").toBeLessThanOrEqual(
          dimensions.viewport
        );
        expect(dimensions.body, "body scroll width").toBeLessThanOrEqual(dimensions.viewport);
      });
    }
  }
});

test("publishes current DX Harness metadata", async ({ page }) => {
  await open(page, "/");
  await expect(page).toHaveTitle("DX Harness — design in code with confidence");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "DX Harness gives coding agents a shared design language, the right skills for each task, and a review before the work returns to you."
  );

  await open(page, "/overview");
  await expect(page).toHaveTitle(/ — DX Harness$/);
});

test("publishes the Granola landing-page messaging baseline", async ({ page }) => {
  await open(page, "/");

  const hero = page.locator("main section").first();
  await expect(hero.getByRole("heading", { name: "Design in code with confidence." })).toBeVisible();
  await expect(hero.getByRole("link", { name: "Quick start" })).toBeVisible();
  await expect(hero.getByRole("link")).toHaveCount(1);

  await expect(
    page.getByRole("heading", { name: "What the harness gives your agent." })
  ).toBeVisible();
  const featureGrid = page.locator("ul").filter({ hasText: "Start with a plain-language request." });
  await expect(featureGrid).toHaveCount(1);
  await expect(featureGrid.locator(":scope > li > div:last-child > p:first-child")).toHaveText([
    "Orchestrator skill",
    "Control catalog",
    "DESIGN.md",
    "Review skill",
  ]);
  await expect(featureGrid.locator("[data-feature-figure]")).toHaveCount(4);

  await expect(
    page.getByRole("heading", { name: "From a request to a reviewed result." })
  ).toBeVisible();
  await expect(page.getByText("Your prompt", { exact: true })).toBeVisible();
  await expect(page.getByText("The harness at work", { exact: true })).toBeVisible();
  await expect(page.getByText("A reviewed result", { exact: true })).toBeVisible();

  await expect(page.getByRole("heading", { name: "Meet your new collaborators" })).toBeVisible();
  for (const role of ["Orchestrator", "Copy", "Pattern", "Polish", "Execute", "Review"]) {
    await expect(page.getByRole("heading", { name: role, exact: true })).toBeVisible();
  }
  await expect(page.locator("[data-skill-mark]")).toHaveCount(6);

  await expect(
    page.getByRole("heading", { name: "A shared language for you and your agent." })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "See all skills" })).toBeVisible();
});

test("skill-mark eyes follow the pointer and respect reduced motion", async ({ page }) => {
  await open(page, "/");

  const cards = page.locator("[data-skill-card]");
  const orchestrator = cards.filter({
    has: page.getByRole("heading", { name: "Orchestrator", exact: true }),
  });
  const eyes = orchestrator.locator("[data-skill-eyes]");

  await expect(cards).toHaveCount(6);
  await expect(eyes).toHaveCount(1);
  await orchestrator.hover({ position: { x: 280, y: 24 } });
  await expect.poll(() => eyes.evaluate((element) => element.style.transform)).not.toBe(
    "translate(0px, 0px)"
  );

  await page.mouse.move(0, 0);
  await expect.poll(() => eyes.evaluate((element) => element.style.transform)).toBe(
    "translate(0px, 0px)"
  );

  await page.emulateMedia({ reducedMotion: "reduce" });
  await orchestrator.hover({ position: { x: 280, y: 24 } });
  await expect.poll(() => eyes.evaluate((element) => element.style.transform)).toBe(
    "translate(0px, 0px)"
  );
});

test("uses the lime site accent without a hero product label", async ({ page }) => {
  await open(page, "/");

  const hero = page.locator("main section").first();
  await expect(hero.getByText("dx-harness", { exact: true })).toHaveCount(0);

  const quickStart = hero.getByRole("link", { name: "Quick start" });
  const colours = await quickStart.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      background: style.backgroundColor,
      border: style.borderColor,
      foreground: style.color,
    };
  });

  expect(colours).toEqual({
    background: "rgb(189, 238, 99)",
    border: "rgb(92, 124, 47)",
    foreground: "rgb(24, 24, 27)",
  });
});

for (const width of mobileWidths) {
  test(`mobile chrome targets are at least 44px at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await open(page, "/harness/loop");
    const primaryNavigation = page.getByRole("navigation", { name: "Primary" });

    await expectMinimumTarget(page.getByRole("button", { name: "Open navigation" }), 44);
    await expectMinimumTarget(
      primaryNavigation.getByRole("link", { name: "For agents", exact: true }),
      44
    );
  });

  test(`mobile catalog targets are at least 44px at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await open(page, "/standards/catalog");

    await expectMinimumTarget(page.getByRole("button", { name: /^L0\b/ }), 44);
    await expectMinimumTarget(
      page.getByRole("button", { name: /^deterministic\b/ }),
      44
    );
    await expectMinimumTarget(page.getByTitle("Copy control ID").first(), 44);
    await expectMinimumTarget(page.getByRole("link", { name: /^Details/ }).first(), 44);
  });
}

test("desktop audited targets are at least 24px", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await open(page, "/standards/catalog");
  const primaryNavigation = page.getByRole("navigation", { name: "Primary" });

  await expectMinimumTarget(
    primaryNavigation.getByRole("link", { name: "For agents", exact: true }),
    24
  );
  await expectMinimumTarget(page.getByRole("button", { name: /^L0\b/ }), 24);
  await expectMinimumTarget(
    page.getByRole("button", { name: /^deterministic\b/ }),
    24
  );
  await expectMinimumTarget(page.getByTitle("Copy control ID").first(), 24);
  await expectMinimumTarget(page.getByRole("link", { name: /^Details/ }).first(), 24);
});

test.describe("reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  const animatedRoutes = [
    { name: "landing", path: "/", essentialText: "What the harness gives your agent." },
    { name: "overview", path: "/overview", essentialText: "Start with the harness" },
  ] as const;

  for (const route of animatedRoutes) {
    test(`${route.name} hydrates cleanly and keeps essential content visible`, async ({ page }) => {
      const hydrationErrors: string[] = [];
      const hydrationPattern = /hydration|hydrated|server rendered html.*match|did not match/i;

      page.on("console", (message) => {
        if (
          (message.type() === "error" || message.type() === "warning") &&
          hydrationPattern.test(message.text())
        ) {
          hydrationErrors.push(message.text());
        }
      });
      page.on("pageerror", (error) => {
        if (hydrationPattern.test(error.message)) hydrationErrors.push(error.message);
      });

      await open(page, route.path);
      await expect(page.locator("main h1").first()).toBeVisible();
      await expect(page.getByText(route.essentialText, { exact: true }).first()).toBeVisible();
      await page.waitForTimeout(250);

      expect(hydrationErrors).toEqual([]);
    });
  }
});
