/**
 * semantic-classes.tsx — parity fixture: every colour goes through a semantic
 * class and every size is on scale. Both engines return zero findings, so the
 * expected records are empty.
 */
export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-primary text-primary-foreground font-display px-4 py-2 rounded-md">
      <p className="text-muted-foreground leading-[1.5]">{children}</p>
    </div>
  );
}
