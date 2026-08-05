import * as React from "react"

// 1024 (Tailwind `lg`) so tablet *and* mobile open the nav as a drawer via the
// trigger, keeping page content full-width below lg; the fixed sidebar shows at lg+.
// Kept in sync with the `lg:` visibility breakpoints in components/ui/sidebar.tsx.
const MOBILE_BREAKPOINT = 1024

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
