import type { Preset } from "./types.ts";

/* Reads the preset <dir>/<name>.md. */
export function loadPreset(name: string, dir: string): Preset {
  throw new Error(`loadPreset is not built yet: ${name} in ${dir}`);
}
