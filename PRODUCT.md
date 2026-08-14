# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary users are product builders, designers, and engineers who use coding
agents while they work. They arrive mid-task and need a reliable next action,
an implementation workflow, or a standard they can apply without translating a
separate design document first.

AI coding agents are a second, first-class audience. They read the same skills,
control catalog, `/llms.txt`, and machine-readable files as the humans who
review their work.

DX Harness began in TransformX's TFX and DXD practice, where teams build for
Singapore's teachers, and is now a general-purpose open-source product for
teams using coding agents.

## Product Purpose

DX Harness gives a team one front door for agent-assisted product development.
It bundles engineering and design workflows, shared standards, deterministic
checks, and independent review so an agent can move from an ask to reviewed
work without each team rebuilding the process around it.

Success means a human or agent can find the right workflow quickly, produce
work against an explicit standard, and reach review with fewer avoidable design
and engineering failures.

## Positioning

DX Harness is not only a collection of prompts or skills. Its durable `dx-`
namespace routes work into a connected system: specialist workflows share one
control catalog, deterministic checks verify what code can prove, and a
separate reviewer evaluates the result. TFX is the origin and proving ground,
not the boundary of who can use it.

## Operating Context

People invoke DX Harness inside agent coding environments while planning,
designing, implementing, reviewing, or maintaining a product. Claude Code is
the primary plugin distribution today; the canonical `SKILL.md` sources can
also be consumed by other compatible agent harnesses.

The documentation website serves two reading paths. Humans browse principles,
guidelines, foundations, setup instructions, and the control catalog. Agents
consume `/llms.txt`, `/llms-full.txt`, Markdown routes, and
`/standards/catalog.yaml` from the same repository truth.

## Capabilities and Constraints

- The repository currently ships 21 `dx-` skills: 8 engineering workflows and
  13 design workflows.
- Design workflows include a shared standards catalog, deterministic Python
  checks, procedures, and an independent design-review agent.
- Human approval remains part of consequential design and implementation
  workflows; automation does not silently replace product judgment.
- The local catalog under `plugins/dx-harness/standards/` is canonical for
  agents and for the website.
- The website is a Next.js application and the design checks require Python 3
  with PyYAML in local development.

## Brand Commitments

The product name is **DX Harness** and its durable command namespace is `dx-`.
“DX” deliberately supports Digital Experience, Digital Excellence, Developer
Experience, and Designer Experience while retaining the DXD Xperience Studio
origin.

The voice is Kind Utility: calm, exact, quietly warm, and useful before it is
promotional. Copy uses plain language, second person, active voice, and
sentence case. The public product may acknowledge its TFX origin without
presenting itself as limited to one organisation or portfolio.

## Evidence on Hand

Repository evidence includes the shipped skill sources, the 70-control catalog,
the deterministic check suite, the separate reviewer definition, the public
documentation routes, and the human- and machine-readable catalog outputs.

No external adoption numbers, customer claims, testimonials, benchmarks,
pricing, or outcome metrics are currently established in the repository.
Future product work must not fabricate them.

## Product Principles

1. **One front door.** A stable namespace should make the right specialist
   workflow easier to find than an improvised prompt.
2. **One truth for humans and agents.** Documentation, skills, checks, and
   machine-readable outputs should resolve to the same standards.
3. **Judgment stays visible.** Human approval and documented decisions remain
   explicit where automation cannot settle the answer.
4. **Verification is independent.** Builders should not be the sole judges of
   their own output; deterministic checks and separate review have different
   jobs.
5. **The harness must exemplify its standard.** Its website, skills, and
   workflows are evidence of whether the system works.

## Accessibility & Inclusion

WCAG AA is non-waivable: body text meets 4.5:1 contrast; large text and UI
components meet 3:1; all controls are keyboard reachable with visible focus;
visible controls have programmatic labels; targets are at least 24px on desktop
and 44px on mobile; reduced-motion preferences preserve content and task state;
and meaning never relies on colour alone.
