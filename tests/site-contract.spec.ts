import { expect, test, type Locator, type Page } from "@playwright/test";

const routes = [
  { name: "landing", path: "/" },
  { name: "overview", path: "/overview" },
  { name: "how to read", path: "/how-to-read" },
  { name: "standards catalog", path: "/standards/catalog" },
  { name: "for agents", path: "/for-agents" },
  { name: "the loop", path: "/harness/loop" },
  { name: "standards index", path: "/standards" },
  { name: "motion foundations", path: "/foundations/motion" },
  { name: "tokens foundations", path: "/foundations/tokens" },
  { name: "governance changes", path: "/governance/changes" },
] as const;

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
    { name: "landing", path: "/", essentialText: "Why a standard, not a style guide" },
    { name: "overview", path: "/overview", essentialText: "Three readers, one standard" },
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
