import { AppHeader } from "@/components/layout/app-header";
import { LiveDateTime } from "@/components/common/live-date-time";
import { FacilitySidebar } from "@/components/layout/facility-sidebar";

export function FacilityShell({ children }: { children: React.ReactNode }) {
  return <div className="facility-app">
    <FacilitySidebar />
    <div className="facility-workspace">
      <AppHeader />
      <main className="facility-main">{children}</main>
      <footer className="facility-footer">
        <div><span>데이터 기준: <LiveDateTime /></span><span>연동 소스: BMS, FMS, IoT 센서</span></div>
        <span>Copyright © 2026 HION. All rights reserved.</span>
      </footer>
    </div>
  </div>;
}
