import { FacilityShell } from "@/components/layout/facility-shell";

export default function FacilityLayout({ children }: { children: React.ReactNode }) {
  return <FacilityShell>{children}</FacilityShell>;
}
