import type { Metadata } from "next";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  BellRing,
  Box,
  CheckCircle2,
  ClipboardCheck,
  Cloud,
  Cpu,
  Database,
  FileSearch,
  FileText,
  FolderOpen,
  Layers3,
  LineChart,
  Network,
  Orbit,
  Search,
  Settings,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { MarketingPage } from "@/components/marketing/page-layout";
import { BreadcrumbJsonLd } from "@/components/marketing/shared";
import { pageMetadata } from "@/lib/marketing/metadata";

export const metadata: Metadata = pageMetadata({
  title: "핵심 기술 | ORBIS D&C",
  description: "3D/BIM Digital Asset, AI Facility Management, Digital Twin Operation으로 이어지는 ORBIS D&C의 핵심 기술을 소개합니다.",
  path: "/solutions",
});

type TechCard = { icon: LucideIcon; title: string; body: string };
type TechPage = {
  number: string;
  title: string;
  subtitle: string;
  body: string;
  label: string;
  featureTitle: string;
  resultTitle: string;
  features: TechCard[];
  process: TechCard[];
  results: TechCard[];
  visual: "asset" | "ai" | "twin";
};

const technologyPages: TechPage[] = [
  {
    number: "01",
    label: "SCHOOL BIM MODEL",
    title: "3D / BIM Digital Asset",
    subtitle: "실제 건물과 시설을 정밀한 3D/BIM 디지털 자산으로 전환합니다.",
    body: "ORBIS D&C의 3D/BIM 기술로 건물과 시설을 정밀하게 디지털화하여 효율적인 건설과 운영을 지원합니다.",
    featureTitle: "기술 프로세스",
    resultTitle: "주요 성과 및 기대효과",
    features: [
      { icon: Box, title: "정밀 모델링", body: "3D/BIM 구축" },
      { icon: Orbit, title: "공간 정보", body: "공간 데이터화" },
      { icon: Settings, title: "설비 자산화", body: "설비 정보 통합" },
      { icon: Network, title: "운영 연계", body: "데이터 활용" },
    ],
    process: [
      { icon: Activity, title: "현장 조사", body: "시설 현황 확인" },
      { icon: Activity, title: "3D/BIM 모델링", body: "건축·구조·설비 모델" },
      { icon: Layers3, title: "공간·설비 구축", body: "자산 단위 연결" },
      { icon: Database, title: "운영 데이터 연계", body: "운영 기준 데이터화" },
    ],
    results: [
      { icon: BarChart3, title: "의사결정 지원", body: "정확한 정보" },
      { icon: FileText, title: "비용 효율화", body: "예측 기반 관리" },
      { icon: Network, title: "협업 강화", body: "통합된 데이터" },
      { icon: Cpu, title: "자산 가치 향상", body: "장기적 활용" },
    ],
    visual: "asset",
  },
  {
    number: "02",
    label: "SCHOOL FACILITY AI MANAGEMENT",
    title: "AI Facility Management",
    subtitle: "시설 데이터를 기반으로 AI가 관리 업무를 지원합니다.",
    body: "ORBIS D&C의 AI Facility Management는 시설 데이터 분석을 통해 운영 효율을 높이고, 이상을 사전에 감지하여 스마트한 시설 운영을 지원합니다.",
    featureTitle: "기술 프로세스",
    resultTitle: "주요 성과 및 기대효과",
    features: [
      { icon: Search, title: "AI 검색", body: "필요한 정보 탐색" },
      { icon: FileText, title: "기록 지원", body: "점검·이력 문서 작성" },
      { icon: Settings, title: "점검 보조", body: "이상 징후 분석" },
      { icon: BarChart3, title: "보고 자동화", body: "분석 기반 보고서" },
    ],
    process: [
      { icon: FolderOpen, title: "자료 탐색", body: "도면·문서 검색" },
      { icon: FileSearch, title: "점검 분석", body: "이력과 현황 분석" },
      { icon: BellRing, title: "조치 제안", body: "우선순위 추천" },
      { icon: Database, title: "이력 관리", body: "작업 결과 축적" },
      { icon: FileText, title: "보고 지원", body: "리포트 자동화" },
    ],
    results: [
      { icon: Activity, title: "업무 효율화", body: "반복 업무 최소화" },
      { icon: Layers3, title: "예방 중심 관리", body: "이상 조기 감지" },
      { icon: Wrench, title: "체계적 운영", body: "데이터 기반 의사결정" },
      { icon: BarChart3, title: "지속 가능한 관리", body: "안전하고 쾌적한 시설" },
    ],
    visual: "ai",
  },
  {
    number: "03",
    label: "SCHOOL DIGITAL TWIN",
    title: "Digital Twin Operation",
    subtitle: "실제 시설의 상태와 변화 이력이 운영 디지털 트윈에 지속적으로 연결됩니다.",
    body: "실제 운영 데이터를 실시간으로 수집해 시설을 더 안전하고 효율적으로 관리합니다.",
    featureTitle: "운영 프로세스",
    resultTitle: "주요 성과 및 기대효과",
    features: [
      { icon: Activity, title: "상태 모니터링", body: "실시간 시설 상태 확인" },
      { icon: Database, title: "이력 추적", body: "점검·작업 이력 관리" },
      { icon: Network, title: "운영 연계", body: "BIM·설비와 데이터 연동" },
      { icon: LineChart, title: "예측 기반 관리", body: "이상 징후 사전 대응" },
    ],
    process: [
      { icon: ClipboardCheck, title: "데이터 수집", body: "실시간 운영 데이터" },
      { icon: BellRing, title: "이상 감지", body: "변화 및 이상 징후" },
      { icon: Wrench, title: "보수 관리", body: "작업 계획 및 수행" },
      { icon: Cloud, title: "운영 반영", body: "시설 데이터 업데이트" },
      { icon: Database, title: "데이터 축적", body: "운영 이력 저장" },
      { icon: BarChart3, title: "예측 관리", body: "효율적 운영" },
    ],
    results: [
      { icon: ClipboardCheck, title: "운영 안정성 향상", body: "이상 징후의 신속 대응" },
      { icon: Settings, title: "유지관리 효율화", body: "작업 시간·비용 절감" },
      { icon: BarChart3, title: "데이터 기반 의사결정", body: "정확한 분석 지원" },
      { icon: ShieldCheck, title: "시설 수명 연장", body: "안전하고 지속적인 운영" },
    ],
    visual: "twin",
  },
];

function CardGrid({ items, compact = false }: { items: TechCard[]; compact?: boolean }) {
  return (
    <div className={compact ? "tech-card-grid is-compact" : "tech-card-grid"}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <article className="tech-info-card" key={item.title}>
            <Icon aria-hidden="true" />
            <div>
              <strong>{item.title}</strong>
              <span>{item.body}</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function ProcessFlow({ items }: { items: TechCard[] }) {
  return (
    <ol className="tech-process-flow">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <li key={item.title}>
            <span className="tech-step-number">0{index + 1}</span>
            <Icon aria-hidden="true" />
            <strong>{item.title}</strong>
            <small>{item.body}</small>
          </li>
        );
      })}
    </ol>
  );
}

function BuildingStack({ variant }: { variant: TechPage["visual"] }) {
  return (
    <div className={`tech-building-stack is-${variant}`} aria-hidden="true">
      <div className="tech-roof" />
      <div className="tech-floor floor-3"><span>3F</span></div>
      <div className="tech-floor floor-2"><span>2F</span></div>
      <div className="tech-floor floor-1"><span>1F</span></div>
      <div className="tech-foundation" />
      <div className="tech-blueprint" />
      {variant !== "ai" ? <div className="tech-campus-glow" /> : <div className="tech-ai-core">AI</div>}
    </div>
  );
}

function DashboardMock({ variant }: { variant: TechPage["visual"] }) {
  const labels = variant === "asset"
    ? ["건축", "구조", "기계설비", "전기설비"]
    : variant === "ai"
      ? ["전체 시설", "진행 점검", "이상 발생", "조치 대기"]
      : ["운영 시설", "에너지", "진행 작업", "이상 알림"];

  return (
    <div className={`tech-dashboard is-${variant}`}>
      <header>
        <span>ORBIS D&amp;C</span>
        <strong>{variant === "asset" ? "BIM Viewer" : variant === "ai" ? "AI Facility Platform" : "Digital Twin Platform"}</strong>
      </header>
      <div className="tech-dashboard-body">
        <aside>{["대시보드", "시설 현황", "점검 관리", "이력 분석"].map((item) => <span key={item}>{item}</span>)}</aside>
        <main>
          <div className="tech-kpi-row">
            {labels.map((item, index) => <div key={item}><small>{item}</small><b>{index === 2 ? "3" : index === 1 ? "24" : "12"}</b></div>)}
          </div>
          <div className="tech-mini-map">
            <BuildingStack variant={variant} />
            <span className="tech-status-chip chip-a">정상 운영</span>
            <span className="tech-status-chip chip-b">{variant === "asset" ? "레이어 선택" : "점검 필요"}</span>
          </div>
        </main>
        <section>
          <div className="tech-chart"><span /><span /><span /><span /><span /></div>
          <ul>
            <li>최근 알림</li>
            <li>점검 일정</li>
            <li>분석 리포트</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function TechVisual({ variant }: { variant: TechPage["visual"] }) {
  if (variant === "asset" || variant === "ai" || variant === "twin") {
    const image = variant === "asset"
      ? {
          src: "/images/orbis/technology-core-01-bim-viewer.png",
          alt: "학교시설 통합 BIM 모델과 BIM Viewer 화면",
          width: 1480,
          height: 1119,
        }
      : variant === "ai"
        ? {
            src: "/images/orbis/technology-core-03-ai-facility-management-final.png",
            alt: "스쿨 시설 AI 관리 대시보드",
            width: 1373,
            height: 1146,
          }
      : {
          src: "/images/orbis/technology-core-04-digital-twin-operation.png",
          alt: "학교 디지털 트윈 운영 대시보드",
          width: 1214,
          height: 1295,
        };

    return (
      <div className={`tech-visual tech-reference-visual tech-reference-${variant}`}>
        <Image
          className="tech-reference-image"
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          priority={variant === "asset"}
          unoptimized
          sizes="(max-width: 1050px) 100vw, 48vw"
        />
      </div>
    );
  }

  const callouts = variant === "asset"
    ? [
        ["3D Model", "건축·구조·설비"],
        ["Space Data", "공간 정보 통합"],
        ["Asset Layer", "설비 자산화"],
        ["BIM Coordination", "운영 데이터 연계"],
      ]
    : variant === "ai"
      ? [
          ["AI Search", "도면 및 기술자료 검색"],
          ["Inspection Support", "이상 징후 자동 분석"],
          ["Report Assist", "보고서 초안 자동 생성"],
          ["Workflow", "점검·조치·이력 연계"],
        ]
      : [
          ["실시간 모니터링", "설비 상태 · 에너지 사용량"],
          ["이력 관리", "점검 · 작업 · 교체 이력"],
          ["예측 분석", "이상 징후 · 성능 저하 감지"],
        ];

  return (
    <div className={`tech-visual tech-visual-${variant}`}>
      <div className="tech-visual-label">{variant === "asset" ? "ARCHITECTURE | STRUCTURE | MEP | ASSET" : variant === "ai" ? "SEARCH | ANALYSIS | RECOMMEND | REPORT" : "OPERATION | MONITORING | HISTORY | ANALYTICS"}</div>
      <BuildingStack variant={variant} />
      <div className="tech-callout-layer">
        {callouts.map(([title, body], index) => (
          <article className={`tech-callout callout-${index + 1}`} key={title}>
            <CheckCircle2 aria-hidden="true" />
            <strong>{title}</strong>
            <span>{body}</span>
          </article>
        ))}
      </div>
      <DashboardMock variant={variant} />
      {variant === "ai" ? (
        <div className="tech-chat-panel">
          <strong>AI Assistant</strong>
          <p>시설 관리에 대해 무엇이든 물어보세요.</p>
          <span>점검 일정과 조치 방법을 안내합니다.</span>
          <span>보고서 초안도 만들 수 있어요.</span>
        </div>
      ) : null}
    </div>
  );
}

function TechnologySection({ page }: { page: TechPage }) {
  return (
    <section className={`technology-page technology-page-${page.visual}`} aria-label={page.title}>
      <div className="technology-page-inner">
        <div className="technology-copy">
          <p className="technology-kicker">CORE TECHNOLOGY {page.number}<span /></p>
          <h1>{page.title}</h1>
          <p className="technology-subtitle">{page.subtitle}</p>
          <p className="technology-body">{page.body}</p>
          <CardGrid items={page.features} />
          <div className="technology-block">
            <h2>{page.featureTitle}<span /></h2>
            <ProcessFlow items={page.process} />
          </div>
          <div className="technology-block">
            <h2>{page.resultTitle}<span /></h2>
            <CardGrid items={page.results} compact />
          </div>
        </div>
        <TechVisual variant={page.visual} />
      </div>
    </section>
  );
}

export default function SolutionsPage() {
  return (
    <MarketingPage>
      <BreadcrumbJsonLd items={[{ name: "홈", path: "/" }, { name: "Technology", path: "/solutions" }]} />
      {technologyPages.map((page) => <TechnologySection key={page.title} page={page} />)}
    </MarketingPage>
  );
}
