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

test("publishes current DX Design Harness metadata", async ({ page }) => {
  await open(page, "/");
  await expect(page).toHaveTitle("DX Design Harness — design in code with confidence");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "The DX Design Harness gives your coding agent a shared design language, the right skills, and a review before the work returns to you."
  );

  await open(page, "/overview");
  await expect(page).toHaveTitle(/ — DX Design Harness$/);
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
  const featureRows = page.locator("ul").filter({ hasText: "Start with a plain-language request." });
  await expect(featureRows).toHaveCount(1);
  await expect(
    featureRows.locator(":scope > li > div:last-child > p:first-child")
  ).toHaveText(["Orchestrator skill", "Control catalog", "Design language skill"]);
  // Each row carries its looping illustration clip (poster set, muted) and the
  // why-it-matters copy inline — nothing is gated behind hover any more.
  await expect(featureRows.locator("[data-feature-illo] video")).toHaveCount(3);
  for (const video of await featureRows.locator("[data-feature-illo] video").all()) {
    await expect(video).toHaveAttribute("poster", /illo-.*-poster\.jpg/);
    await expect(video).toHaveAttribute("loop", "");
    await expect(video).toHaveAttribute("muted", "");
  }
  await expect(featureRows.getByText("Why it matters")).toHaveCount(3);

  await expect(
    page.getByRole("heading", { name: "From a request to a reviewed result." })
  ).toBeVisible();
  await expect(page.getByText("Your prompt", { exact: true })).toBeVisible();
  await expect(page.getByText("The harness at work", { exact: true })).toBeVisible();
  await expect(page.getByText("A reviewed result", { exact: true })).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "The skills inside the harness." })
  ).toBeVisible();
  for (const role of ["Orchestrator", "Copy", "Pattern", "Polish", "Execute", "Review"]) {
    await expect(page.getByRole("heading", { name: role, exact: true })).toBeVisible();
  }
  await expect(page.locator("[data-skill-tool]")).toHaveCount(6);

  await expect(
    page.getByRole("heading", { name: "A shared language for you and your agent." })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "See all skills" })).toBeVisible();
});



test("the sheet ground draws in the flanks only, and only when there is room", async ({
  page,
}) => {
  const construction = () => page.locator("svg[viewBox='0 0 320 760']");

  // Below 1200 the flanks are too narrow to hold a scale: the layer is absent
  // rather than crowding the sheet edge. It is decorative, so nothing is lost.
  await page.setViewportSize({ width: 1199, height: 900 });
  await open(page, "/");
  await expect(construction().first()).toBeHidden();

  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(construction()).toHaveCount(2);
  await expect(construction().first()).toBeVisible();

  // The load-bearing constraint: nothing the ground draws may sit inside the
  // sheet, because that is where every glyph on the page lives.
  const intrusion = await page.evaluate(() => {
    const sheetElement = document.querySelector("[data-sheet]");
    if (!sheetElement) throw new Error("the landing sheet is missing its [data-sheet] hook");
    const sheet = sheetElement.getBoundingClientRect();
    const parts = document.querySelectorAll(
      "svg[viewBox='0 0 320 760'], [style*='repeating-linear-gradient']"
    );
    return [...parts]
      .map((element) => element.getBoundingClientRect())
      .filter((box) => box.width > 0)
      .reduce(
        (worst, box) =>
          Math.max(worst, Math.min(box.right, sheet.right) - Math.max(box.left, sheet.left)),
        0
      );
  });
  expect(intrusion).toBeLessThanOrEqual(0);
});

test("looping feature illustrations never play under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "/");

  // No per-clip control exists any more (builder ruling, 2026-08-18), so the
  // reduced-motion path is the one stop mechanism — it must hold absolutely:
  // the clip rests on its poster and never starts.
  const firstIllo = page.locator("[data-feature-illo]").first();
  await firstIllo.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await expect(
    firstIllo.locator("video").evaluate((el) => {
      const video = el as HTMLVideoElement;
      return { paused: video.paused, t: video.currentTime };
    })
  ).resolves.toEqual({ paused: true, t: 0 });
  await expect(page.locator("[data-feature-illo] button")).toHaveCount(0);
});

test("the builders' band states the page's own words, with nothing to attribute", async ({
  page,
}) => {
  await open(page, "/");

  await expect(
    page.getByText("The harness is our product too", { exact: false })
  ).toBeVisible();

  // Nothing here claims to quote or sign: the band began as a blockquote citing
  // /note with words the note never says, and the signature that replaced it was
  // cut too. The words stand alone.
  await expect(page.locator('blockquote[cite="/note"]')).toHaveCount(0);
  await expect(page.getByText("The TransformX product design team")).toHaveCount(0);

  // /note is not orphaned by the cut — the nav on this layout still reaches it.
  await expect(
    page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: /note/i })
  ).toHaveAttribute("href", "/note");

  // The prompt and its copy button are gone. Install is one hop away at
  // /harness/install, which is what the band's one action points at.
  const band = page.locator("section", {
    has: page.getByText("The harness is our product too", { exact: false }),
  });
  await expect(band.getByRole("button")).toHaveCount(0);
  await expect(band.getByRole("link", { name: "Quick start" })).toHaveAttribute(
    "href",
    "/harness/install"
  );
});

test("the notices page serves the licence texts it owes, and links their sources", async ({
  page,
}) => {
  await open(page, "/legal");

  /* The texts have to be SERVED, not referenced: MIT, ISC and BSD grant
     redistribution on the condition that their notices appear in the copies you
     ship, so a page of links would not discharge it. `pnpm check:notices` keeps
     the data current; this keeps it rendered. */
  const notices = page.locator("main pre");
  expect(await notices.count(), "verbatim notice texts").toBeGreaterThan(50);
  await expect(notices.first()).toContainText("Permission is hereby granted");

  // Every package links to its upstream source, for provenance rather than
  // discharge — one entry per package, whether or not it declares a repository.
  const entries = page.locator("main li");
  const sourceLinks = page.locator("main li a[href^='https://']");
  expect(await entries.count()).toBeGreaterThan(150);
  expect(await sourceLinks.count()).toBeGreaterThan(150);

  // The GPL-3.0 label is the one the footer used to get wrong.
  await expect(page.getByText("GPL-3.0", { exact: false }).first()).toBeVisible();
});

test("the builders' band and the close paint one ground", async ({ page }) => {
  await open(page, "/");

  const grounds = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll("section"));
    const band = sections.find((s) =>
      s.textContent?.includes("The harness is our product too")
    );
    const close = sections.find((s) =>
      s.querySelector("h2")?.textContent?.includes("A shared language")
    );
    const paint = (el: Element | undefined) => (el ? getComputedStyle(el).backgroundColor : null);
    return { band: paint(band), close: paint(close) };
  });

  expect(grounds.band).not.toBeNull();
  expect(grounds.band).toBe(grounds.close);
});

test("the run reveals its three cards one at a time, from an empty figure", async ({ page }) => {
  await open(page, "/");

  const figure = page.locator('figure[role="img"]');
  const cardOpacities = () =>
    figure.evaluate((fig) =>
      Array.from(fig.firstElementChild!.children)
        .slice(0, 3)
        .map((c) => Number(getComputedStyle(c).opacity))
    );

  // Before the section is reached: the figure holds its height, and not one
  // card is drawn. This is the builder's ask — no placeholders waiting to fill.
  await expect
    .poll(async () => (await figure.boundingBox())!.height > 0)
    .toBe(true);
  expect(await cardOpacities()).toEqual([0, 0, 0]);

  /* Sample in the page rather than from the test: each card's arrival is
     recorded the frame its opacity first settles, so the assertion is about
     ORDER — which is the actual contract — instead of catching one card mid-fade
     at a wall-clock guess. */
  await figure.evaluate((fig) => {
    const cards = Array.from(fig.firstElementChild!.children).slice(0, 3);
    const w = window as unknown as { __arrivals: (number | null)[] };
    w.__arrivals = [null, null, null];
    const t0 = performance.now();
    const tick = () => {
      let pending = false;
      cards.forEach((c, i) => {
        if (w.__arrivals[i] !== null) return;
        if (Number(getComputedStyle(c).opacity) > 0.99) w.__arrivals[i] = performance.now() - t0;
        else pending = true;
      });
      if (pending) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  await figure.scrollIntoViewIfNeeded();
  await expect
    .poll(
      () => page.evaluate(() => (window as unknown as { __arrivals: (number | null)[] }).__arrivals.filter((a) => a !== null).length),
      { timeout: 15_000 }
    )
    .toBe(3);

  const arrivals = (await page.evaluate(
    () => (window as unknown as { __arrivals: number[] }).__arrivals
  )) as number[];
  expect(arrivals[0], "card 01 lands before card 02").toBeLessThan(arrivals[1]);
  expect(arrivals[1], "card 02 lands before card 03").toBeLessThan(arrivals[2]);

  // The whole sequence stays inside WCAG 2.2.2's five-second boundary, past
  // which an auto-starting animation owes the reader a visible stop control.
  expect(arrivals[2], "the run settles inside five seconds").toBeLessThan(5000);

  // Settled: the stack is back at its natural offset, which is the state the
  // server renders and a no-JS reader gets.
  await expect
    .poll(() => figure.evaluate((fig) => getComputedStyle(fig.firstElementChild!).translate))
    .toBe("0px");
  expect(await cardOpacities()).toEqual([1, 1, 1]);
});

test("the harness run scrubs by stage and respects reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await open(page, "/");

  // Reduced motion: the finished run is simply visible — no autoplay needed.
  await expect(page.getByText("design review passed")).toBeVisible();

  // The stages are buttons; picking one moves the current marker.
  const stage2 = page.getByRole("button", { name: /The harness at work/ });
  await stage2.click();
  await expect(stage2).toHaveAttribute("aria-current", "step");
  // The run plays once when it scrolls into view, so there is no replay control.
  await expect(page.getByRole("button", { name: "Replay the run" })).toHaveCount(0);

  // The orchestrator visibly runs the specialised skills.
  await expect(page.getByText("layout pass · reads catalog + DESIGN.md")).toBeVisible();
  await expect(page.getByText("polish pass · reads catalog + DESIGN.md")).toBeVisible();
});

test("selecting a run stage shows only that stage's graphic", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });

  const heightOf = () =>
    page.locator('figure[role="img"]').evaluate((el) => el.getBoundingClientRect().height);

  const assertIsolatesWithoutReflow = async () => {
    const resting = await heightOf();

    // Stage 01: the terminal alone — no panel rows, no result badge.
    await page.getByRole("button", { name: /Your prompt/ }).click();
    await expect(page.getByText("layout pass · reads catalog + DESIGN.md")).toBeHidden();
    await expect(page.getByText("design review passed")).toBeHidden();
    // Stage 01's own enrichment shows; stage 02's does not.
    await expect(
      page.getByText("dx-design reads it and brings in only the skills it needs."),
    ).toBeVisible();
    await expect(
      page.getByText("The control catalog: shared design rules every skill reads first."),
    ).toBeHidden();

    // Stage 02: the panel alone, with its own source notes.
    await page.getByRole("button", { name: /The harness at work/ }).click();
    await expect(
      page.getByText("The control catalog: shared design rules every skill reads first."),
    ).toBeVisible();
    await expect(
      page.getByText("dx-design reads it and brings in only the skills it needs."),
    ).toBeHidden();

    // Stage 03: the result alone — the panel rows are gone, and it carries no
    // annotation of its own (the badge above already says what one would say).
    await page.getByRole("button", { name: /A reviewed result/ }).click();
    await expect(page.getByText("design review passed")).toBeVisible();
    await expect(page.getByText("layout pass · reads catalog + DESIGN.md")).toBeHidden();
    await expect(
      page.getByText("dx-design reads it and brings in only the skills it needs."),
    ).toBeHidden();
    await expect(
      page.getByText("The control catalog: shared design rules every skill reads first."),
    ).toBeHidden();

    // Exactly one stage is ever current.
    await expect(page.locator('[aria-current="step"]')).toHaveCount(1);

    // Isolating a step must not reflow the column.
    await expect(await heightOf()).toBe(resting);
  };

  // 1280: the default desktop viewport.
  await open(page, "/");
  await assertIsolatesWithoutReflow();

  // 360: the invariant must hold at mobile widths too, not only desktop.
  await page.setViewportSize({ width: 360, height: 800 });
  await open(page, "/");
  await assertIsolatesWithoutReflow();
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
    border: "rgb(88, 120, 40)",
    foreground: "rgb(24, 24, 27)",
  });
});

for (const width of mobileWidths) {
  test(`mobile chrome targets are at least 44px at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await open(page, "/harness/loop");

    await expectMinimumTarget(page.getByRole("button", { name: "Open navigation" }), 44);
    // The topbar's one remaining link is the wordmark home. The "For agents"
    // link that used to sit opposite it was removed; nothing replaced it, and
    // the empty nav landmark went with it.
    await expectMinimumTarget(page.getByRole("link", { name: /DX Design Harness|^dx$/ }), 44);
    await expect(page.getByRole("navigation", { name: "Primary" })).toHaveCount(0);
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

  await expectMinimumTarget(page.getByRole("link", { name: /DX Design Harness/ }), 24);
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
