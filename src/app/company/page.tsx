import type { Metadata } from "next";
import Image from "next/image";
import { MarketingPage } from "@/components/marketing/page-layout";
import { BreadcrumbJsonLd } from "@/components/marketing/shared";
import { pageMetadata } from "@/lib/marketing/metadata";

export const metadata: Metadata = pageMetadata({
  title: "회사소개 | ORBIS D&C",
  description: "현장과 도면에 흩어진 건물 정보를 디지털 자산으로 만들고 디지털 트윈과 AI에 연결하는 ORBIS D&C를 소개합니다.",
  path: "/company",
});

export default function CompanyPage() {
  return (
    <MarketingPage>
      <BreadcrumbJsonLd items={[{ name: "홈", path: "/" }, { name: "회사소개", path: "/company" }]} />

      <section className="company-hero-custom" aria-label="오르비스 회사소개">
        <div className="marketing-container company-hero-custom-grid">
          <div className="company-hero-logo" aria-label="ORBIS 로고">
            <Image
              src="/images/orbis/company-signature-white-extracted.png"
              alt="ORBIS"
              width={480}
              height={310}
              priority
              quality={100}
              unoptimized
            />
          </div>
          <div className="company-hero-copy">
            <h1>
              <span>가상과 현실을 연결하는 커맨드 센터,</span>
              <span>건설의 미래를 데이터로 지배하다</span>
            </h1>
            <p>
              오르비스는 현장과 도면에 흩어진 건물 정보를<br />
              유지관리 가능한 디지털 자산으로 만들고,<br />
              이를 디지털 트윈과 AI에 연결하는 건설 디지털·운영 전문기업입니다.
            </p>
          </div>
        </div>
      </section>

      <section className="company-image-section company-history-section" aria-label="대표 연혁">
        <div className="marketing-container company-image-wrap company-image-wrap-wide">
          <Image
            src="/images/orbis/ceo-history.png"
            alt="오르비스디앤씨 대표 연혁"
            width={8000}
            height={4500}
            sizes="(max-width: 760px) 100vw, 92vw"
          />
        </div>
      </section>

      <section className="company-image-section company-organization-section" aria-label="조직도">
        <div className="marketing-container company-image-wrap company-image-wrap-portrait">
          <Image
            src="/images/orbis/orbis-organization-2026.png"
            alt="2026 오르비스 조직도"
            width={2340}
            height={3124}
            sizes="(max-width: 760px) 100vw, 72vw"
          />
        </div>
      </section>
    </MarketingPage>
  );
}
