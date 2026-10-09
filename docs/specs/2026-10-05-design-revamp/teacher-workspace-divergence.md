# Teacher Workspace sandbox divergence

**Date:** 2026-10-09
**Supports:** P1-2, P1-4, P1-13, and P1-14 in [the P1 stories](stories/p1-designer.md)

This file records how the Teacher Workspace design sandbox and its production repo diverge. It is evidence for the stories above, and it reads the two repos as they stood on the date above.

## The two repos

| | Sandbox | Production |
| --- | --- | --- |
| Repo | `transformteamsg/design-teacher-workspace` (private) | [`transformteamsg/teacher-workspace`](https://github.com/transformteamsg/teacher-workspace) (public) |
| Created | 2026-01-08 | 2026-06-09 |
| Layout | One Vite app, with Bun | A pnpm workspace with `apps/host`, `apps/mock-edupass`, and a Go server |
| Router | `@tanstack/react-router` | `react-router` |
| Tailwind | Tailwind 4, no prefix | Tailwind 4, with `prefix(tw)` in `apps/host/src/App.css` |
| Colours | Radix colour scales, such as `crimson` and `slate`, imported in `src/styles.css` | Fixed hex values, such as `--primary: #0064ff`, and Tailwind's default palette |
| UI components | 48 shadcn components in `src/components/ui/` | Nine components in `apps/host/src/components/ui/` |
| Design records | `DESIGN.md`, `PRODUCT.md`, and `GLOSSARY.md` | No `DESIGN.md` |

The sandbox is five months older than production. It chose its router, its Tailwind setup, and its colour scales before production existed, and production chose differently.

## How the work flows

1. Designers prototype features in the sandbox and hide unfinished ones behind feature flags.
2. Designers hand a finished design to engineers.
3. Engineers build the design again in production.
4. Production changes do not flow back to the sandbox. Designers keep building on the sandbox versions.

## One component in both repos

The app card shows the same design in each repo:

- Sandbox: `src/components/app-card.tsx` at commit `e13602f`, 183 lines.
- Production: [`apps/host/src/components/AppCard.tsx` at commit `86559f1`](https://github.com/transformteamsg/teacher-workspace/blob/86559f1754e1b075346a175efdae21150d20b38d/apps/host/src/components/AppCard.tsx), 98 lines.

| | Sandbox | Production |
| --- | --- | --- |
| Hover colours | `crimson-9`, `twblue-9`, `orange-9`, `lime-9`, and `violet-9` | `pink-500`, `blue-600`, `orange-500`, `green-500`, and `purple-500` |
| Corner radius | `rounded-[var(--radius-card)]` | `rounded-[14px]` |
| Card background | `bg-card` | `bg-background` |
| Badge | The shared `Badge` component, `variant="info"` | An inline `<span>` with `bg-blue-100` and `text-blue-700` |
| Featured card | A separate `FeaturedAppCard` component | An `isFeatured` prop, with a `#C8C8C8` border |
| Icon | A Lucide icon or an image | An image only |
| Props | `name`, `onClick`, and `className` | `title`. No `onClick` and no `className` |
| Import alias | `@/` | `~/` |

## What the rebuild lost

- **Tokens became fixed values.** Production defines `--radius: 0.625rem` and derives `--radius-xl` as 14 pixels, but its app card writes `rounded-[14px]` instead of the token. The badge colours and the featured border are also fixed values.
- **A shared component became inline markup.** The sandbox badge uses the shared `Badge` component. Production writes its own `<span>`, so a change to the badge style does not reach the card.
- **A behaviour was probably lost.** In the sandbox, the hover classes change the colour of the icon. In production, the same kind of class sits on an overlay `<div>` that holds no text, so it probably has no effect. This comes from a read of the code. Nobody has checked it in a browser.
- **The design language is in the repo that does not ship.** `DESIGN.md` is in the sandbox only, so production has no record to build or check against.

None of these differences is a decision that someone recorded. Each one came from a rebuild of the design in a different stack.

## Why the gap grows

- The two repos share no code, so every hand-off is a rebuild, and every rebuild adds differences.
- Engineers change production components, and the sandbox does not receive the changes.
- Designers build new prototypes on the sandbox versions, so each new design starts further from production.

## What the stories take from this

- **P1-13:** a new app's repo starts in the stack that the production apps use, because the sandbox chose its stack first and production chose another.
- **P1-14:** a check at the start of each design and a one-way sync of shipped components keep the sandbox in step with production. A sync can copy only when the two stacks agree.
- **P1-4:** a hand-off from the sandbox stays a rebuild until the sandbox and production share foundations.
- **P1-2:** the sandbox owns `DESIGN.md`, as it does here, and a change to it goes to production in the next hand-off.
