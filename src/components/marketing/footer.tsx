import Link from "next/link";
import Image from "next/image";
import { footerNavigation, siteConfig } from "@/content/site";

export function MarketingFooter() {
  return (
    <footer className="marketing-footer">
      <div className="marketing-container footer-main">
        <div>
          <Link className="wordmark wordmark-light" href="/" aria-label="ORBIS D&C 홈">
            <Image className="brand-logo brand-logo-footer" src="/images/orbis/orbis-dnc-logo.png" width={170} height={84} alt="" />
          </Link>
          <p className="footer-brand-line">{siteConfig.brandLine}</p>
        </div>
        <nav className="footer-nav" aria-label="하단 메뉴">
          {footerNavigation.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </nav>
      </div>
      <div className="marketing-container footer-meta">
        <div>
          <strong>{siteConfig.legalName}</strong>
          <address>{siteConfig.address}</address>
        </div>
        <div className="footer-contact">
          <a href={`tel:${siteConfig.telephone.replaceAll("-", "")}`}>전화 {siteConfig.telephone}</a>
          <span>팩스 {siteConfig.fax}</span>
          <a href={siteConfig.url}>웹사이트 {siteConfig.website}</a>
        </div>
      </div>
      <div className="marketing-container footer-bottom">
        <span>© {new Date().getFullYear()} ORBIS D&amp;C. All rights reserved.</span>
        <span>건물의 정보가 운영의 기준이 되도록</span>
      </div>
    </footer>
  );
}
