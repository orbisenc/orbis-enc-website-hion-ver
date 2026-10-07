import type { Metadata } from "next";
import Image from "next/image";
import { AlertTriangle, BellRing, Box, BrainCircuit, Building2, CheckCircle2, ClipboardCheck, Compass, Cpu, Database, FolderOpen, ScrollText, Settings, ShieldCheck, TrendingUp } from "lucide-react";
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
const problemVisuals = [
  {
    src: "/images/orbis/operational-gap-drawing-mismatch.png",
    alt: "도면과 실제 기계실 설비 현황이 맞지 않아 현장에서 대조하는 모습",
  },
  {
    src: "/images/orbis/operational-gap-fragmented-data.png",
    alt: "설비별 데이터가 서로 다른 저장소에 흩어져 연결되지 않은 모습",
  },
  {
    src: "/images/orbis/operational-gap-emergency-repair.png",
    alt: "누수와 전기 경고에 긴급 보수팀이 대응하며 2차 피해를 확인하는 모습",
  },
  {
    src: "/images/orbis/operational-gap-budget-priority.png",
    alt: "설비 교체와 예산 우선순위를 판단하기 어려운 대시보드 화면",
  },
];
const solutionDirections = [
  {
    src: "/images/orbis/hion-solution-digital-asset.png",
    alt: "태블릿으로 설비 배관과 장비를 3D BIM 디지털 자산으로 확인하는 모습",
    title: "3D/BIM 기반 디지털 자산화",
  },
  {
    src: "/images/orbis/hion-solution-integrated-info.png",
    alt: "도면, 사진, 문서, 점검 이력을 HiON 데이터베이스로 통합하는 모습",
    title: "시설 정보·이력 통합 관리",
  },
  {
    src: "/images/orbis/hion-solution-field-response.png",
    alt: "현장에서 태블릿으로 점검을 등록하고 고장 접수와 조치 흐름을 관리하는 모습",
    title: "현장 중심 점검·고장 대응",
  },
  {
    src: "/images/orbis/hion-solution-data-decision.png",
    alt: "설비 건전도와 우선순위, 수명 예측, 예산 분석 대시보드를 확인하는 모습",
    title: "데이터 기반 교체·예산 의사결정",
  },
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
        <div className="marketing-container home-hero-grid home-hero-redesign">
          <div className="home-hero-copy">
            <h1><span className="hero-title-line">AI · Digital Twin 기술을 결합한</span><br/><em>시설물 디지털 자산화 전문기업</em></h1>
            <p className="hero-lead">건설·시설의 현실 공간을 데이터가 살아있는 디지털 자산으로</p>
            <p className="hero-body">3D/BIM · Digital Twin · AI 기술을 기반으로 시설의 구축부터 운영·관리까지 연결합니다.</p>
            <div className="hero-pill-row" aria-label="핵심 기술">
              <span><Building2 size={19} aria-hidden="true" />3D/BIM</span>
              <span><Database size={19} aria-hidden="true" />Digital Asset</span>
              <span><BrainCircuit size={19} aria-hidden="true" />AI</span>
              <span><Settings size={19} aria-hidden="true" />Facility Management</span>
            </div>
            <div className="hero-school-card">
              <div>
                <span>Education Solution</span>
                <strong>HiON School</strong>
                <p>학교의 모든 시설정보를 하나의 3D/BIM 디지털 자산으로</p>
              </div>
            </div>
            <div className="hero-actions">
              <ButtonLink href="/solutions">Technology</ButtonLink>
              <ButtonLink href="/industries/education" variant="secondary">HiON School</ButtonLink>
            </div>
          </div>
          <div className="hero-digital-scene" aria-hidden="true">
            <Image src="/images/orbis/hion-school-hero-right.png" alt="" fill priority sizes="(max-width: 1050px) 100vw, 58vw" />
          </div>
        </div>
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
      <section className="section operational-gap-section">
        <div className="marketing-container operational-gap-container">
          <SectionHeading title="시설관리의 구조적 문제점" body="문서 중심•사후 대응 중심의 현재 운영 방식은 학교 현장의 시설관리 생산성을 낮춤" />
          <div className="problem-grid">{problems.map((problem, index) => (
            <article key={problem}>
              <div className="problem-media">
                <Image src={problemVisuals[index].src} alt={problemVisuals[index].alt} fill sizes="(max-width: 760px) 100vw, 25vw" />
              </div>
              <div className="problem-copy">
                <span>0{index + 1}</span>
                <h3>{problem}</h3>
              </div>
            </article>
          ))}</div>
        </div>
      </section>
      <section className="section hion-solution-section">
        <div className="marketing-container hion-solution-container">
          <SectionHeading
            title="HiON 기반 해결 방향"
            body="3D/BIM 디지털 자산과 AI 기반 운영관리로 시설관리의 비효율을 구조적으로 개선"
          />
          <div className="solution-direction-grid">
            {solutionDirections.map((item, index) => (
              <article key={item.title}>
                <div className="solution-direction-media">
                  <Image src={item.src} alt={item.alt} fill sizes="(max-width: 760px) 100vw, 25vw" />
                </div>
                <div className="solution-direction-copy">
                  <span>0{index + 1}</span>
                  <h3>{item.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section predictive-operation-section">
        <div className="marketing-container predictive-operation-container">
          <div className="predictive-operation-heading">
            <h2>사후관리에서 <em>사전예측관리로</em></h2>
            <p>고장 발생 후 대응하는 시설관리를 고장 전 예측하는 관리로 변화합니다.</p>
          </div>
          <div className="predictive-operation-board">
            <article className="reactive-panel">
              <div className="predictive-panel-title reactive-title">
                <span><AlertTriangle aria-hidden="true" /></span>
                <strong>기존 사후대응</strong>
              </div>
              <div className="reactive-image-stack">
                <Image src="/images/orbis/predictive-reactive-incidents.png" alt="누수, 냉난방 고장, 수기 점검 기록이 함께 보이는 기존 사후대응 이미지" fill sizes="(max-width: 1050px) 100vw, 28vw" />
                {["누수 발생", "냉난방 고장", "수기기록·보고"].map((label) => (
                  <div className="reactive-alert" key={label}>
                    <span>!</span>
                    <strong>{label}</strong>
                  </div>
                ))}
              </div>
            </article>
            <div className="predictive-arrow" aria-hidden="true">→</div>
            <article className="hion-predictive-panel">
              <div className="predictive-panel-title hion-title">
                <span><CheckCircle2 aria-hidden="true" /></span>
                <strong>HiON 예측관리</strong>
                <small>데이터가 알려주는, 더 안전한 학교</small>
              </div>
              <div className="predictive-feature-strip">
                {[
                  { icon: Box, title: "디지털 트윈 모니터링", body: "3D 기반 학교 시설의 실시간 상태 모니터링" },
                  { icon: Database, title: "예측 기반 정비 계획", body: "설비 상태를 분석하여 최적의 정비 시점과 계획을 제시" },
                  { icon: BrainCircuit, title: "AI 이상 알림", body: "이상 징후를 사전에 감지하여 신속한 대응을 지원" },
                ].map(({ icon: Icon, title, body }) => (
                  <div key={title}>
                    <span><Icon aria-hidden="true" /></span>
                    <strong>{title}</strong>
                    <p>{body}</p>
                  </div>
                ))}
              </div>
              <div className="predictive-dashboard-grid">
                <div className="predictive-dashboard-card twin-card">
                  <div className="predictive-card-header">
                    <strong>3D 기반 시설 모니터링</strong>
                    <span>›</span>
                  </div>
                  <div className="twin-image">
                    <Image src="/images/orbis/predictive-digital-twin-dashboard.png" alt="학교 시설의 3D 디지털 트윈 모니터링 대시보드" fill sizes="(max-width: 1050px) 100vw, 28vw" />
                  </div>
                </div>
                <div className="predictive-dashboard-card plan-card">
                  <div className="predictive-card-header">
                    <strong>설비 예측 분석 및 정비 계획</strong>
                    <span>›</span>
                  </div>
                  <div className="maintenance-table" aria-label="설비 예측 정비 계획">
                    {[
                      ["냉난방 설비", "정상", "30일 이내"],
                      ["전기 설비", "정상", "60일 이내"],
                      ["펌프 설비", "주의", "90일 이내"],
                      ["급수 설비", "정상", "정상"],
                    ].map(([name, status, timing]) => (
                      <div key={name}>
                        <strong>{name}</strong>
                        <span className={status === "주의" ? "status-caution" : "status-good"}>{status}</span>
                        <small>{timing}</small>
                        <i />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="predictive-dashboard-card alert-card">
                  <div className="predictive-card-header">
                    <strong>AI 이상 알림</strong>
                    <span>›</span>
                  </div>
                  <div className="alert-banner">
                    <BellRing aria-hidden="true" />
                    <strong>이상 징후 감지</strong>
                    <p>급수 펌프 진동 수치 상승이 감지되었습니다.</p>
                  </div>
                  <div className="alert-device-image">
                    <Image src="/images/orbis/predictive-ai-alert-dashboard.png" alt="노트북과 모바일에 표시된 AI 이상 감지 알림 대시보드" fill sizes="(max-width: 1050px) 100vw, 28vw" />
                  </div>
                </div>
              </div>
            </article>
          </div>
          <div className="predictive-benefit-bar">
            {[
              { icon: ShieldCheck, title: "고장 예방", body: "이상 징후 사전 감지" },
              { icon: Database, title: "비용 절감", body: "계획 정비로 불필요한 비용 감소" },
              { icon: TrendingUp, title: "데이터 기반 의사결정", body: "정확한 데이터로 효율적 관리" },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title}>
                <span><Icon aria-hidden="true" /></span>
                <strong>{title}</strong>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section hion-school-section">
        <div className="marketing-container hion-school-container">
          <div className="hion-school-copy">
            <p className="hion-school-label">HiON School</p>
            <h2>
              학교의 모든 시설정보를<br />
              <span className="hion-title-nowrap"><em>3D/BIM 디지털 자산</em>으로</span>
            </h2>
            <p className="hion-school-subtitle">3D/BIM 디지털 자산 · AI 관리 플랫폼</p>
            <p className="hion-school-body">
              도면, 사진, 점검, 보수, 시설 이력 등 학교의 모든 시설정보를 하나로 통합한
              {" "}
              <br />
              3D/BIM 디지털 자산으로, AI가 지원하는 스마트한 학교 시설관리를 제공합니다.
            </p>
            <div className="hion-feature-row" aria-label="HiON School 주요 기능">
              {[
                { icon: Box, label: "3D/BIM 자산" },
                { icon: FolderOpen, label: "시설 자산 DB" },
                { icon: ClipboardCheck, label: "점검·보수 관리" },
                { icon: Cpu, label: "AI 도우미" },
                { icon: ScrollText, label: "운영 이력 추적" },
              ].map(({ icon: Icon, label }) => (
                <article key={label}>
                  <Icon aria-hidden="true" />
                  <strong>{label}</strong>
                </article>
              ))}
            </div>
          </div>
          <div className="hion-school-visual" aria-hidden="true">
            <Image src="/images/orbis/hion-school-dashboard-right-clean-v2.png" alt="" fill sizes="(max-width: 1050px) 100vw, 54vw" />
          </div>
        </div>
        <div className="hion-school-bottom" aria-label="HiON School 운영 효과">
          {[
            { icon: Database, label: "시설정보 통합" },
            { icon: Settings, label: "현장 처리 간소화" },
            { icon: BrainCircuit, label: "AI 업무 지원" },
            { icon: Compass, label: "데이터 기반 운영" },
          ].map(({ icon: Icon, label }) => (
            <div key={label}>
              <span><Icon aria-hidden="true" /></span>
              <strong>{label}</strong>
            </div>
          ))}
        </div>
      </section>
      <section className="section section-navy connected-delivery-section">
        <div className="marketing-container connected-delivery-container">
          <SectionHeading title="현장을 읽고, 자산을 만들고, 운영을 연결합니다" body="서로 끊긴 용역이 아니라 다음 단계로 이어지는 하나의 실행 체계입니다." />
          <ProcessFlow />
          <MediaSequence items={[
            { src: "/images/orbis/planning-digital-model.jpg", alt: "도시와 건물 계획안을 디지털 모델로 검토하는 개념 이미지", label: "기획·현황", caption: "현장과 계획 정보를 디지털 기준으로 정리" },
            { src: "/images/orbis/bim-design.jpg", alt: "건물 골조와 여러 설계 도면을 함께 검토하는 BAM 개념 이미지", label: "BAM 구축", caption: "형상·도면·설비 정보를 운영 자산으로 연결" },
            { src: "/images/orbis/operations-digital-building.jpg", alt: "건물 운영 데이터와 상태 정보를 통합 확인하는 개념 이미지", label: "통합운영", caption: "운영 이력과 상태를 다음 판단의 근거로 축적" },
          ]} />
        </div>
      </section>
      <section className="section legacy-hion-overview">
        <div className="marketing-container overview-grid">
          <div className="section-heading"><p className="eyebrow">HiON</p><h2>건물의 전체 생애주기를 하나의 운영 체계로</h2><p>HiON은 자산·공간, 도면·문서, 점검·작업, 유지관리 이력, 비용과 이상정보를 연결해 여러 건물과 사용자가 같은 데이터를 보고 움직이게 합니다.</p><div style={{marginTop:32}}><ButtonLink href="/hion" variant="text">HiON 기능 자세히 보기</ButtonLink></div></div>
          <CapabilityGrid />
        </div>
      </section>
      <FinalCta title="우리 시설은 어디서부터 디지털화해야 할까요?" body="도면과 데이터가 정리되지 않은 상태라도 현황진단부터 시작할 수 있습니다." />
    </MarketingPage>
  );
}
