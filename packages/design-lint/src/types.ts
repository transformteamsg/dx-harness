/* The shapes that the loader, the resolver, the runner, and the reporter share.
   A rule file is the standard. A rule module is the code that implements it. */

export type Surface = "source" | "rendered" | "project";
export type Tier = "L0" | "L1" | "L2";

/* The frontmatter of a lint rule file. A judged rule has no file. */
export interface RuleMeta {
  code: string;
  dss: string;
  tier: Tier;
  surface: Surface;
  engine: string;
  judgedRemainder: string[];
  redirects: string[];
  /* Each value that a check reads, with its default. A default of null means
     that the product must set the value. */
  parameters: Record<string, unknown>;
  title: string;
  file: string;
}

export interface Finding {
  code: string;
  tier: Tier;
  file: string;
  line: number;
  column: number;
  message: string;
}

/* A rule that did not produce a verdict. A note never counts as a pass. */
export interface Note {
  code: string;
  /* "no-module" means that the rule has no code yet. It marks the scaffold
     and is ignored by the exit code. Remove it when every rule has a module.
     "skipped" names the preset lines that an L0 rule ignored. The rule still
     runs, so the note does not change the exit code. */
  kind: "not-configured" | "not-run" | "no-module" | "skipped";
  detail: string[];
}

export interface Candidate {
  file: string;
  line: number;
  column: number;
  data?: unknown;
}

export type Params = Record<string, unknown>;

/* What a rendered rule may do with a page. It exposes DOM evaluation only, which
   every engine offers, so the browser stays swappable. */
export interface RenderedPage {
  /* fn runs in the page. It must not use anything from the module around it.
     The argument carries the values that it needs. */
  evaluate<R, A = undefined>(fn: (arg: A) => R, arg?: A): Promise<Awaited<R>>;
  /* Adds a script to the page. An engine library such as axe-core goes in this way. */
  inject(script: string): Promise<void>;
  /* Interaction. These change the state of the page, so open the page with
     fresh: true, which gives the rule its own copy. */
  press(key: string): Promise<void>;
  hover(selector: string): Promise<void>;
  click(selector: string): Promise<void>;
  focus(selector: string): Promise<void>;
  /* A PNG of the page, or of the first element that matches the selector. */
  screenshot(selector?: string): Promise<Uint8Array>;
}

export interface OpenOptions {
  /* A page of its own, not shared with other rules. Use it when the rule interacts. */
  fresh?: boolean;
}

export interface RenderedSession {
  open(pagePath: string, viewport: { width: number; height: number }, options?: OpenOptions): Promise<RenderedPage>;
}

export interface RuleContext {
  /* Every file under the paths that the command received. */
  files: string[];
  /* The directory that the rendered session serves, and the project root. */
  root: string;
  params: Params;
  /* Present only for a rendered rule. */
  rendered?: RenderedSession;
}

/* locate finds candidates. decide applies the policy and the parameters. This
   is the split that checks/rules/*.yml and the Python checks already follow. */
export interface RuleModule {
  code: string;
  surface: Surface;
  locate(ctx: RuleContext): Candidate[] | Promise<Candidate[]>;
  decide(candidate: Candidate, params: Params): string | null;
}

export interface Config {
  /* Other config files, relative to this one. They load first, and this file merges over them. */
  extends?: string[];
  /* Rules to run. A --select flag overrides it. */
  select?: string[];
  /* The directory that the rendered rules serve, relative to the config file. */
  serve?: string;
  /* How a rendered page counts as loaded. The default, "networkidle", suits an app
     that fetches data. A static site can set "load". */
  render?: { waitUntil?: "load" | "networkidle" };
  /* The domain preset, by name. It sits between the rule defaults and this file. */
  preset?: string;
  product?: Params;
  pages?: Record<string, string[]>;
  flows?: Record<string, string[]>;
  rules?: Record<string, Params>;
}

/* The values of a domain preset. See lint/config.md. */
export interface Preset {
  name: string;
  file: string;
  parameters: Params;
  rules: Record<string, Params>;
  ignore: string[];
  /* The line in the file of each ignore entry and each rule override, keyed
     "ignore CODE" and "rules.CODE.PARAM". The skipped-line report reads it. */
  lines: Record<string, number>;
}
