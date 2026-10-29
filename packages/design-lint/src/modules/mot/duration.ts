import { rel } from "../tl/shared.ts";
import { globToRegExp } from "../tl/tl-2.ts";
import type { Candidate, RuleModule } from "../../types.ts";
import { message, position } from "../wo/util.ts";
import { motionFile, motionValues } from "./scan.ts";

/* MOT-1a: interface motion runs for minMs to maxMs, with an easing that does not
   overshoot, and a transition names its properties. An animation that repeats
   with no end is a loading or progress indicator, which the control does not flag. */
export const mot1a: RuleModule = {
  code: "MOT-1a",
  surface: "source",

  locate({ files, root, params }) {
    const min = Number(params.minMs);
    const max = Number(params.maxMs);
    const narrative = (params.narrativeFiles as string[]).map(globToRegExp);
    const out: Candidate[] = [];
    for (const file of files.filter(motionFile)) {
      if (narrative.some((re) => re.test(rel(root, file)))) continue;
      const { text, values } = motionValues(file);
      for (const v of values) {
        let note: string | null = null;
        if (v.kind === "all") note = `The ${v.property === "class" ? "class" : "transition"} ${v.value} animates each property that changes. Name the properties, such as transition: opacity 200ms ease-out.`;
        else if (v.kind === "easing" && v.overshoots) note = `The easing ${v.value} overshoots. Use an ease-out or ease-in-out curve.`;
        else if (v.kind === "duration" && !v.infinite && v.ms !== 0 && (v.ms! < min || v.ms! > max)) {
          note = `The duration ${v.value} is outside ${min}ms to ${max}ms. Use a duration in this band for interface motion.`;
        }
        if (note) out.push({ file, ...position(text, v.offset), data: { message: note } });
      }
    }
    return out;
  },
  decide: message,
};
