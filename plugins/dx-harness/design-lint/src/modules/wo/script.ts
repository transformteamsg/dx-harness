import fs from "node:fs";
import tseslint from "typescript-eslint";
import { isHtml } from "../../files.ts";
import { elements, matches } from "../../html.ts";
import type { Candidate, RuleModule } from "../../types.ts";
import { SCRIPT_FILE, message, position } from "./util.ts";

/* The source rules of WO that read handlers: WO-3b, WO-14b, WO-15a, and WO-17a.
   They find candidates in the text of markup and script files. A handler that a
   framework or a build step adds is not seen. */

/* The pattern for one event name in source: the inline attribute or the React
   prop (onkeydown, onKeyDown), or the name as a string (addEventListener("keydown")). */
function eventPattern(names: string[]): RegExp {
  const bases = names.map((n) => n.replace(/^on/i, "").replace(/[^\w]/g, ""));
  const alt = [...new Set(bases)].join("|");
  return new RegExp(`\\bon(?:${alt})\\b|["'\`](?:${alt})["'\`]`, "gi");
}

function scanFiles(files: string[]): { file: string; text: string }[] {
  return files.filter((f) => SCRIPT_FILE.test(f)).map((file) => ({ file, text: fs.readFileSync(file, "utf8") }));
}

/* WO-3b: a key handler that tests one printable character and no modifier. */
export const wo3b: RuleModule = {
  code: "WO-3b",
  surface: "source",

  locate({ files, params }) {
    const events = eventPattern(params.keyEvents as string[]);
    const exempt = (params.exemptSelectors as string[]).map((s) => s.replace(/'/g, '"')).join(",");
    const single = /\bkey\s*===?\s*(["'`])(\S)\1|\bcase\s+(["'`])(\S)\3\s*:/;
    const modifier = /\b(?:ctrlKey|altKey|metaKey)\b/;
    const out: Candidate[] = [];
    for (const { file, text } of scanFiles(files)) {
      const skipLines = new Set<number>();
      if (exempt && isHtml(file)) {
        for (const el of elements(text)) if (matches(el, exempt)) skipLines.add(el.line);
      }
      for (const m of text.matchAll(events)) {
        const at = position(text, m.index ?? 0);
        if (skipLines.has(at.line)) continue;
        /* The handler body: up to the next handler of the same kind, or 500 characters. */
        const rest = text.slice((m.index ?? 0) + m[0].length);
        const next = rest.search(events);
        const body = rest.slice(0, Math.min(500, next === -1 ? 500 : next));
        const hit = single.exec(body);
        if (hit && !modifier.test(body)) {
          out.push({ file, ...at, data: { message: `This key handler acts on the single character "${hit[2] ?? hit[4]}" with no modifier key. Require ctrl, alt, or meta, or offer a setting that turns the shortcut off.` } });
        }
      }
    }
    return out;
  },
  decide: message,
};

/* WO-14b: a handler for a gesture event, or an import of a gesture library. */
export const wo14b: RuleModule = {
  code: "WO-14b",
  surface: "source",

  locate({ files, params }) {
    const events = eventPattern(params.gestureEvents as string[]);
    const libs = (params.gestureLibraries as string[]).map((l) => l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const lib = libs.length ? new RegExp(`(?:from|require\\(|import)\\s*\\(?\\s*["'\`](?:${libs.join("|")})(?:/[^"'\`]*)?["'\`]|<script[^>]+src=["'][^"']*(?:${libs.join("|")})[^"']*["']`, "gi") : null;
    const out: Candidate[] = [];
    for (const { file, text } of scanFiles(files)) {
      for (const m of text.matchAll(events)) {
        out.push({ file, ...position(text, m.index ?? 0), data: { message: `A handler for the gesture event ${m[0].replace(/["'`]/g, "")}. Confirm that a single tap or click does the same thing.` } });
      }
      if (lib) {
        for (const m of text.matchAll(lib)) {
          out.push({ file, ...position(text, m.index ?? 0), data: { message: "A gesture library is loaded. Confirm that each gesture has a single-point alternative." } });
        }
      }
    }
    return out;
  },
  decide: message,
};

/* WO-17a: a listener for a motion event. */
export const wo17a: RuleModule = {
  code: "WO-17a",
  surface: "source",

  locate({ files, params }) {
    if (params.motionEssential === true) return [];
    const events = eventPattern(params.motionEvents as string[]);
    const out: Candidate[] = [];
    for (const { file, text } of scanFiles(files)) {
      for (const m of text.matchAll(events)) {
        out.push({ file, ...position(text, m.index ?? 0), data: { message: `A listener for the motion event ${m[0].replace(/["'`]/g, "")}. Provide a setting that turns motion actuation off and a control that does the same thing.` } });
      }
    }
    return out;
  },
  decide: message,
};

/* WO-15a: a down-event handler on an activation element. HTML is read as
   elements. JSX and TSX are read as an AST. An element that drags or slides is skipped. */
const SKIP = 'canvas, [draggable], input[type="range"], [role="slider"], [role="scrollbar"]';
const ACTIVATION_ROLES = new Set(["button", "link"]);

interface Opening {
  tag: string;
  names: string[];
  statics: Record<string, string>;
  line: number;
  column: number;
}

function jsxOpenings(source: string): Opening[] {
  let ast: any;
  try {
    ast = (tseslint.parser as any).parseForESLint(source, { ecmaFeatures: { jsx: true }, loc: true, range: true }).ast;
  } catch {
    return [];
  }
  const out: Opening[] = [];
  const walk = (node: any) => {
    if (!node || typeof node !== "object") return;
    if (node.type === "JSXOpeningElement" && node.name.type === "JSXIdentifier") {
      const names: string[] = [];
      const statics: Record<string, string> = {};
      for (const a of node.attributes) {
        if (a.type !== "JSXAttribute" || a.name.type !== "JSXIdentifier") continue;
        names.push(a.name.name);
        if (a.value?.type === "Literal") statics[a.name.name] = String(a.value.value);
      }
      out.push({ tag: node.name.name, names, statics, line: node.loc.start.line, column: node.loc.start.column + 1 });
    }
    for (const key of Object.keys(node)) {
      if (key === "parent" || key === "loc" || key === "range") continue;
      const v = node[key];
      if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v.type === "string") walk(v);
    }
  };
  walk(ast);
  return out;
}

export const wo15a: RuleModule = {
  code: "WO-15a",
  surface: "source",

  locate({ files, params }) {
    const down = new Set((params.downEvents as string[]).map((e) => `on${e.replace(/^on/i, "").toLowerCase()}`));
    const activation = String(params.activationSelector).replace(/'/g, '"');
    const essential = (params.essentialDownEventSelectors as string[]).map((s) => s.replace(/'/g, '"')).join(",");
    const out: Candidate[] = [];
    const add = (file: string, line: number, column: number, handler: string) =>
      out.push({ file, line, column, data: { message: `The activation element has the ${handler} handler. Run the action on the up event, so that a user can cancel by moving away.` } });
    for (const file of files) {
      if (isHtml(file)) {
        for (const el of elements(fs.readFileSync(file, "utf8"))) {
          const handler = Object.keys(el.attrs).find((a) => down.has(a.toLowerCase()));
          if (!handler || !matches(el, activation) || matches(el, SKIP) || (essential && matches(el, essential))) continue;
          add(file, el.line, el.column, handler);
        }
      } else if (/\.(?:jsx|tsx)$/i.test(file)) {
        for (const o of jsxOpenings(fs.readFileSync(file, "utf8"))) {
          const handler = o.names.find((n) => down.has(n.toLowerCase()));
          if (!handler) continue;
          const role = o.statics.role;
          const type = o.statics.type;
          const isActivation =
            o.tag === "button" || (o.tag === "a" && o.names.includes("href")) || (role !== undefined && ACTIVATION_ROLES.has(role)) ||
            (o.tag === "input" && (type === "button" || type === "submit"));
          const skipped = o.tag === "canvas" || o.names.includes("draggable") || type === "range" || role === "slider" || role === "scrollbar";
          if (isActivation && !skipped) add(file, o.line, o.column, handler);
        }
      }
    }
    return out;
  },
  decide: message,
};
