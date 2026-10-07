import type { ReactNode } from "react";
import { MarketingFooter } from "./footer";
import { MarketingHeader } from "./header";
import { SectionWheelScroll } from "./section-wheel-scroll";

export function MarketingPage({ children }: { children: ReactNode }) {
  return <div className="marketing-site"><SectionWheelScroll /><a className="skip-link" href="#main-content">본문으로 바로가기</a><MarketingHeader /><main id="main-content">{children}</main><MarketingFooter /></div>;
}
