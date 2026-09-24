import * as React from "react"

// 1024 (Tailwind `lg`) so tablet *and* mobile open the nav as a drawer via the
// trigger, keeping page content full-width below lg; the fixed sidebar shows at lg+.
// Kept in sync with the `lg:` visibility breakpoints in components/ui/sidebar.tsx.
const MOBILE_BREAKPOINT = 1024

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

// false on the server and during hydration, so the server markup matches.
export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.innerWidth < MOBILE_BREAKPOINT,
    () => false
  )
}
