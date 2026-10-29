import { rel } from "../tl/shared.ts";
import { globToRegExp } from "../tl/tl-2.ts";
import type { Candidate, RuleModule } from "../../types.ts";
import { message, position } from "../wo/util.ts";
import { definesToken, motionFile, motionValues } from "./scan.ts";

/* MOT-2a: where the project declares a motion token set, each duration and
   easing in component code comes from a token. A product with no token set gets
   no finding: the control grades it as not applicable. A Tailwind scale class,
   such as duration-200, is not a raw value. */
export const mot2a: RuleModule = {
  code: "MOT-2a",
  surface: "source",

  locate({ files, root, params }) {
    const prefixes = (params.tokenPrefixes as string[]).map(String);
    const tokenFiles = (params.tokenFiles as string[]).map(globToRegExp);
    const componentFiles = (params.componentFiles as string[]).map(globToRegExp);
    const candidates = files.filter(motionFile);
    const isTokenFile = (file: string) => tokenFiles.some((re) => re.test(rel(root, file)));
    if (!candidates.some((f) => isTokenFile(f) || definesToken(f, prefixes))) return [];
    const out: Candidate[] = [];
    for (const file of candidates) {
      if (isTokenFile(file) || !componentFiles.some((re) => re.test(rel(root, file)))) continue;
      const { text, values } = motionValues(file);
      for (const v of values) {
        if (v.kind === "all" || v.scale || (v.kind === "duration" && v.ms === 0)) continue;
        const what = v.kind === "easing" ? "easing" : "duration";
        out.push({ file, ...position(text, v.offset), data: { message: `The raw ${what} ${v.value} is not a motion token. Use a token of the declared set, whose name starts with ${prefixes.join(" or ")}.` } });
      }
    }
    return out;
  },
  decide: message,
};
