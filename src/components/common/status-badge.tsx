export function StatusBadge({ children, tone = "info" }: { children: React.ReactNode; tone?: "info" | "success" | "warning" | "danger" | "muted" }) {
  return <span className={`facility-status facility-status-${tone}`}>{children}</span>;
}
