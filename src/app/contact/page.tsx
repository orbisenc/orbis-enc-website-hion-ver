import type { Metadata } from "next";
import { ContactForm } from "@/components/marketing/contact-form";
import { MarketingPage } from "@/components/marketing/page-layout";
import { BreadcrumbJsonLd } from "@/components/marketing/shared";
import { siteConfig } from "@/content/site";
import { pageMetadata } from "@/lib/marketing/metadata";

export const metadata: Metadata = pageMetadata({
  title: "도입·기술 연계·사업 제휴 문의 | ORBIS D&C",
  description: "HiON 도입, 현황진단과 BAM 구축, AI 예측관리, 기술 연계와 사업 제휴를 문의하세요.",
  path: "/contact",
});

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const query = await searchParams;
  const defaults = query.type === "education"
    ? { inquiryType: "HiON 도입", facilityType: "학교·교육시설" }
    : query.type === "partnership"
      ? { inquiryType: "사업 제휴" }
      : {};

  return (
    <MarketingPage>
      <BreadcrumbJsonLd items={[{ name: "홈", path: "/" }, { name: "문의", path: "/contact" }]} />
      <section className="section section-soft">
        <div className="marketing-container contact-layout">
          <div className="contact-info">
            <h1><span>디지털로 연결하고,</span><span>AI로 운영하세요.</span></h1>
            <dl className="contact-details">
              <div>
                <dt>전화</dt>
                <dd><a href={`tel:${siteConfig.telephone.replaceAll("-", "")}`}>{siteConfig.telephone}</a></dd>
              </div>
              <div>
                <dt>팩스</dt>
                <dd>{siteConfig.fax}</dd>
              </div>
              <div>
                <dt>주소</dt>
                <dd>{siteConfig.address}</dd>
              </div>
            </dl>
          </div>
          <ContactForm defaults={defaults} />
        </div>
      </section>
    </MarketingPage>
  );
}
