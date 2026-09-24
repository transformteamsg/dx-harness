import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** false on the server and during hydration, true after it: the render a
    client-only value may appear in without a hydration mismatch. A component
    mounted after hydration reads true on its first render. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
