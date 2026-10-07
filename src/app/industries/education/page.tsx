import type { Metadata } from "next";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  BellRing,
  Bot,
  Box,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Cpu,
  Database,
  FileText,
  FolderOpen,
  Search,
  ShieldCheck,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { MarketingPage } from "@/components/marketing/page-layout";
import { BreadcrumbJsonLd } from "@/components/marketing/shared";
import { pageMetadata } from "@/lib/marketing/metadata";

export const metadata: Metadata = pageMetadata({
  title: "HiON School | ORBIS D&C",
  description: "학교 시설정보를 3D/BIM 디지털 자산과 AI 운영관리로 연결하는 HiON School을 소개합니다.",
  path: "/industries/education",
});

type IconItem = { icon: LucideIcon; title: string; body?: string };

const hionSchoolFeatures: IconItem[] = [
  { icon: Building2, title: "3D/BIM 자산" },
  { icon: FolderOpen, title: "시설 자산 DB" },
  { icon: ClipboardCheck, title: "점검·보수 관리" },
  { icon: Cpu, title: "AI 도우미" },
  { icon: FileText, title: "운영 이력 추적" },
];

const hionSchoolEffects: IconItem[] = [
  { icon: Database, title: "시설정보 통합" },
  { icon: Wrench, title: "현장 처리 간소화" },
  { icon: Bot, title: "AI 업무 지원" },
  { icon: BarChart3, title: "데이터 기반 운영" },
];

const problemRows = [
  ["도면·사진·점검·보수 이력 분산", "시설 자료가 문서·엑셀·폴더에 흩어져 필요한 정보를 찾기 어려움"],
  ["담당자 변경 시 관리 데이터 단절", "인수인계가 사람의 기억과 파일 정리에 의존해 관리 수준이 달라짐"],
  ["시설·설비 상태와 교체주기 파악 한계", "냉난방기·소방·마감재 등 시설별 상태와 교체 주기를 한눈에 보기 어려움"],
  ["AI 활용용 구조화 자산 데이터 부족", "데이터가 정리되어 있지 않아 검색·보고·예측관리 자동화로 연결되기 어려움"],
];

function EducationPageOne() {
  return (
    <section className="section hion-school-section" aria-label="HiON School 개요">
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
            <br />
            3D/BIM 디지털 자산으로, AI가 지원하는 스마트한 학교 시설관리를 제공합니다.
          </p>
          <div className="hion-feature-row" aria-label="HiON School 주요 기능">
            {hionSchoolFeatures.map(({ icon: Icon, title }) => (
              <article key={title}>
                <Icon aria-hidden="true" />
                <strong>{title}</strong>
              </article>
            ))}
          </div>
        </div>
        <div className="hion-school-visual" aria-hidden="true">
          <Image src="/images/orbis/hion-school-dashboard-right-clean-v2.png" alt="" fill sizes="(max-width: 1050px) 100vw, 54vw" />
        </div>
      </div>
      <div className="hion-school-bottom" aria-label="HiON School 운영 효과">
        {hionSchoolEffects.map(({ icon: Icon, title }) => (
          <div key={title}>
            <span><Icon aria-hidden="true" /></span>
            <strong>{title}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function EducationPageTwo() {
  return (
    <section className="hion-deck-section" aria-label="학교 시설 데이터 문제점">
      <div className="hion-code-slide hion-code-slide-problem">
        <header className="hion-code-heading">
          <h2>학교 시설 데이터가 흩어지면,<br /><em>관리 기준도 사라집니다.</em></h2>
          <p>흩어진 학교 시설 데이터를 하나로 모아, 체계적이고 지속 가능한 관리의 시작을 만듭니다.</p>
        </header>
        <div className="hion-problem-layout">
          <div className="hion-problem-list">
            {problemRows.map(([title, body], index) => (
              <article key={title}>
                <div className="hion-problem-thumb">{[FolderOpen, Search, AlertTriangle, Cpu].map((Icon, i) => i === index ? <Icon key={title} /> : null)}</div>
                <div><strong>{title}</strong><span>{body}</span></div>
              </article>
            ))}
          </div>
          <div className="hion-voice-image" aria-label="실제 사용자 목소리 인포그래픽">
            <Image src="/images/orbis/actual-user-voice-infographic-cropped.png" alt="실제 사용자 목소리 인포그래픽" fill sizes="(max-width: 1050px) 100vw, 38vw" />
          </div>
        </div>
      </div>
    </section>
  );
}

function EducationPageThree() {
  return (
    <section className="hion-deck-section" aria-label="3D BIM 자산 구축에서 AI 관리까지">
      <div className="hion-code-slide">
        <header className="hion-code-heading">
          <h2>HiON은 <em>3D/BIM 자산 구축</em>에서 <em>AI 관리</em>까지 연결</h2>
          <p>학교 세부시설 데이터를 디지털 자산으로 구축하고 AI가 즉시 활용할 수 있는 운영 데이터 체계로 전환합니다.</p>
        </header>
        <div className="hion-smart-transition-image" aria-label="스마트 시설관리 전환 인포그래픽">
          <Image
            src="/images/orbis/smart-facility-transition-infographic-cropped.png"
            alt="사람이 직접 찾아다니는 방식에서 HiON 기반 스마트 시설관리 방식으로 전환되는 과정을 설명하는 인포그래픽"
            fill
            quality={100}
            unoptimized
            sizes="(max-width: 1050px) 100vw, 86vw"
          />
        </div>
      </div>
    </section>
  );
}

function EducationPageFour() {
  return (
    <section className="hion-deck-section" aria-label="기존 방식을 미래적으로 지원">
      <div className="hion-code-slide hion-code-slide-table">
        <header className="hion-code-heading">
          <h2>기존 방식을 미래적으로 지원하는<br /><em>HiON School</em></h2>
          <p>학교 시설 관리 업무를 더 쉽고, 빠르고, 스마트하게 바꿉니다.</p>
        </header>
        <div className="hion-support-layout">
          <div className="hion-method-image" aria-label="기존 방식과 HiON 방식 비교표">
            <Image
              src="/images/orbis/future-support-combined-infographic.png"
              alt="기존 방식과 HiON 방식의 시설관리 업무 처리 차이를 비교한 표"
              fill
              quality={100}
              unoptimized
              sizes="(max-width: 1050px) 100vw, 88vw"
            />
          </div>
          <div className="hion-metric-image" aria-label="업무 효율 개선 지표">
            <Image
              src="/images/orbis/future-work-metrics-cropped.png"
              alt="자료 찾는 시간 감소, 반복 업무 감소, 정보 관리 편리성 증가, 업무 효율성 증가 지표"
              fill
              quality={100}
              unoptimized
              sizes="(max-width: 1050px) 100vw, 28vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function EducationPageFive() {
  return (
    <section className="section predictive-operation-section" aria-label="사후관리에서 사전예측관리로">
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
  );
}

function EducationPageSix() {
  return (
    <section className="hion-deck-section" aria-label="구축 이후 운영 지원">
      <div className="hion-code-slide hion-code-slide-support">
        <header className="hion-code-heading">
          <h2>HiON은 구축 이후가 더 중요합니다</h2>
          <p>단순 구축이 아니라, 실제 유지관리 업무를 함께 지원하는 운영형 플랫폼입니다.</p>
        </header>
        <div className="hion-operation-support-image" aria-label="HiON 운영지원 통합 인포그래픽">
          <Image
            src="/images/orbis/hion-operation-support-infographic-cropped.png"
            alt="HiON 운영지원의 공사 데이터 관리, 품의 행정 지원, 업체 공사 지원, 완료 점검 지원, 전문 기술자문과 운영지원 가치를 설명하는 인포그래픽"
            fill
            quality={100}
            unoptimized
            sizes="(max-width: 1050px) 100vw, 88vw"
          />
        </div>
      </div>
    </section>
  );
}

function EducationPageSeven() {
  return (
    <section className="hion-deck-section hion-keiis-section" aria-label="KEIIS와 HiON의 역할">
      <div className="hion-code-slide hion-code-slide-keiis">
        <header className="hion-code-heading">
          <h2><em>KEIIS</em>는 행정의 기준, <em>HiON</em>은 현장 운영의 기준</h2>
          <p>HiON은 KEIIS를 대체하는 시스템이 아니라, 학교시설 운영·유지관리를 디지털화하고 필요한 행정정보를 연결하는 플랫폼입니다.</p>
        </header>
        <div className="hion-keiis-infographic" aria-label="KEIIS와 HiON 역할 비교 인포그래픽">
          <Image
            src="/images/orbis/keiis-hion-role-infographic-cropped.png"
            alt="KEIIS는 교육시설 행정정보 통합망, HiON은 3D/BIM 디지털 자산과 AI 관리 플랫폼으로 상호보완되는 역할을 설명하는 인포그래픽"
            fill
            quality={100}
            unoptimized
            sizes="(max-width: 1050px) 100vw, 88vw"
          />
        </div>
      </div>
    </section>
  );
}

export default function EducationPage() {
  return (
    <MarketingPage>
      <BreadcrumbJsonLd items={[{ name: "홈", path: "/" }, { name: "HiON School", path: "/industries/education" }]} />
      <EducationPageOne />
      <EducationPageTwo />
      <EducationPageThree />
      <EducationPageFour />
      <EducationPageFive />
      <EducationPageSix />
      <EducationPageSeven />
    </MarketingPage>
  );
}
