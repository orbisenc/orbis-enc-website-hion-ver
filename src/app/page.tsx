import type { Metadata } from "next";
import Image from "next/image";
import { Braces, Compass, Link2, Wrench } from "lucide-react";
import { siteConfig } from "@/content/site";
import { pageMetadata } from "@/lib/marketing/metadata";
import { MarketingPage } from "@/components/marketing/page-layout";
import { ButtonLink, CapabilityGrid, FinalCta, HeroMedia, MediaSequence, ProcessFlow, SectionHeading } from "@/components/marketing/shared";

export const metadata: Metadata = pageMetadata({
  title: "AI 건물 통합운영 플랫폼 HiON | ORBIS D&C",
  description: siteConfig.description,
  path: "/",
});

const problems = ["도면과 실제 현황의 불일치", "설비 정보와 관리 이력의 분절", "반복되는 긴급보수와 2차 피해", "교체·예산 우선순위의 근거 부족"];
const differentiators = [
  { icon: Compass, text: "현황진단부터 운영까지 연결" },
  { icon: Braces, text: "유지관리에 쓰이는 BAM" },
  { icon: Wrench, text: "건설 실무와 플랫폼 기술의 결합" },
  { icon: Link2, text: "현장에서 작동하는 단일 정보원 구축" },
];

export default function HomePage() {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.legalName,
    alternateName: siteConfig.name,
    url: siteConfig.url,
    telephone: siteConfig.telephone,
    address: { "@type": "PostalAddress", streetAddress: siteConfig.address, addressCountry: "KR" },
  };
  return (
    <MarketingPage>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replaceAll("<", "\\u003c") }} />
      <section className="home-hero">
        <div className="marketing-container home-hero-grid">
          <div>
            <p className="eyebrow eyebrow-light">AI 기반 건물 통합운영 플랫폼 HiON</p>
            <h1>건물의 모든 자산과 운영 데이터를 하나로.<br/><em>고장 전에 움직이는 시설관리.</em></h1>
            <p className="hero-body">오르비스디앤씨는 현황진단과 BAM 구축부터 시설자산화, 통합운영, AI 예측관리까지 건물 운영의 전 과정을 데이터 기반 체계로 전환합니다.</p>
            <div className="hero-actions"><ButtonLink href="/contact">도입 상담하기</ButtonLink><ButtonLink href="/hion" variant="secondary">HiON 살펴보기</ButtonLink></div>
          </div>
          <HeroMedia src="/images/orbis/home-building-operations-20260813.png" alt="건물의 구조와 설비, 디지털 운영 화면을 함께 보여 주는 통합운영 이미지" caption="건물 자산과 운영 데이터를 연결한 통합운영 이미지" priority />
        </div>
      </section>
      <section className="section">
        <div className="marketing-container">
          <SectionHeading eyebrow="OPERATIONAL GAP" title="시설정보는 흩어지고, 관리는 고장 뒤에 시작되고 있지 않나요?" />
          <div className="problem-grid">{problems.map((problem, index) => <article key={problem}><span>0{index + 1}</span><h3>{problem}</h3></article>)}</div>
        </div>
      </section>
      <section className="section section-navy">
        <div className="marketing-container">
          <SectionHeading eyebrow="CONNECTED DELIVERY" title="현장을 읽고, 자산을 만들고, 운영을 연결합니다" body="서로 끊긴 용역이 아니라 다음 단계로 이어지는 하나의 실행 체계입니다." />
          <ProcessFlow />
          <MediaSequence items={[
            { src: "/images/orbis/planning-digital-model.jpg", alt: "도시와 건물 계획안을 디지털 모델로 검토하는 개념 이미지", label: "기획·현황", caption: "현장과 계획 정보를 디지털 기준으로 정리" },
            { src: "/images/orbis/bim-design.jpg", alt: "건물 골조와 여러 설계 도면을 함께 검토하는 BAM 개념 이미지", label: "BAM 구축", caption: "형상·도면·설비 정보를 운영 자산으로 연결" },
            { src: "/images/orbis/operations-digital-building.jpg", alt: "건물 운영 데이터와 상태 정보를 통합 확인하는 개념 이미지", label: "통합운영", caption: "운영 이력과 상태를 다음 판단의 근거로 축적" },
          ]} />
          <p className="media-disclaimer">위 이미지는 제공된 회사소개서의 서비스 개념 이미지이며 특정 프로젝트 실적이나 성과를 의미하지 않습니다.</p>
        </div>
      </section>
      <section className="section">
        <div className="marketing-container overview-grid">
          <div className="section-heading"><p className="eyebrow">HiON</p><h2>건물의 전체 생애주기를 하나의 운영 체계로</h2><p>HiON은 자산·공간, 도면·문서, 점검·작업, 유지관리 이력, 비용과 이상정보를 연결해 여러 건물과 사용자가 같은 데이터를 보고 움직이게 합니다.</p><div style={{marginTop:32}}><ButtonLink href="/hion" variant="text">HiON 기능 자세히 보기</ButtonLink></div></div>
          <CapabilityGrid />
        </div>
      </section>
      <section className="section section-soft">
        <div className="marketing-container">
          <SectionHeading eyebrow="PREDICTIVE OPERATION" title="고장 대응에서, 근거 있는 예측 운영으로" body="사후 대응의 기록이 다음 판단을 위한 데이터가 되도록 운영의 고리를 닫습니다." />
          <div className="comparison-panel">
            <div className="comparison-side before"><span>BEFORE · 사후 대응</span><ol><li>고장 발견</li><li>긴급 출동</li><li>복구</li><li>같은 문제 반복</li></ol></div>
            <div className="comparison-arrow" aria-hidden="true">→</div>
            <div className="comparison-side after"><span>AFTER · 예측 운영</span><ol><li>상태 수집</li><li>이상징후 탐지</li><li>계획정비</li><li>결과 축적</li><li>예측 개선</li></ol></div>
          </div>
          <p className="ai-note">AI 분석 결과는 시설관리 담당자의 점검·보수·교체 판단을 지원하며, 최종 의사결정을 대신하거나 결과를 보장하지 않습니다.</p>
        </div>
      </section>
      <section className="section">
        <div className="marketing-container education-showcase">
          <div className="education-image"><Image src="/images/gurye-school-cutaway.png" alt="교실, 체육관, 기계실의 공간과 설비를 함께 보여 주는 학교 건물 단면 설명 이미지" fill sizes="(max-width: 1050px) 100vw, 55vw" /><p className="image-note">시설자산 연결 개념을 설명하기 위한 이미지이며, 실제 구축 실적을 의미하지 않습니다.</p></div>
          <div className="education-copy"><p className="eyebrow eyebrow-light">EDUCATION FACILITIES</p><h2>학교시설 업무,<br/>더 빠르고 더 안전하게</h2><p>건축·전기·기계·소방·통신 설비를 개별 자산으로 등록하고 점검부터 교체까지 이력을 축적해 사후보수를 예방 중심의 시설관리로 전환합니다.</p><ButtonLink href="/industries/education">학교시설 솔루션 보기</ButtonLink></div>
        </div>
      </section>
      <section className="section section-soft">
        <div className="marketing-container">
          <SectionHeading eyebrow="WHY ORBIS D&C" title="디지털 모델이 현장 운영으로 이어지도록" />
          <div className="differentiator-grid">{differentiators.map(({icon: Icon,text}, index) => <article key={text}><span><Icon aria-hidden="true" /></span><h3><small>0{index+1}</small><br/>{text}</h3></article>)}</div>
        </div>
      </section>
      <FinalCta title="우리 시설은 어디서부터 디지털화해야 할까요?" body="도면과 데이터가 정리되지 않은 상태라도 현황진단부터 시작할 수 있습니다." />
    </MarketingPage>
  );
}
