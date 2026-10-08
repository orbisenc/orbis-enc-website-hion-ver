import type { Metadata } from "next";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  Bot,
  Building2,
  ClipboardCheck,
  Cpu,
  Database,
  FileText,
  FolderOpen,
  Search,
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
            <Image src="/images/orbis/actual-user-voice-infographic-red.png" alt="실제 사용자 목소리 인포그래픽" fill sizes="(max-width: 1050px) 100vw, 38vw" />
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
        <div className="predictive-infographic-image">
          <Image
            src="/images/orbis/predictive-management-system-infographic.png"
            alt="기존 사후대응 방식에서 사전예측관리 시스템으로 전환되는 과정을 보여주는 인포그래픽"
            fill
            sizes="(max-width: 1050px) 100vw, 92vw"
            priority
            unoptimized
          />
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
          <h2><em className="hion-keiis-word">KEIIS</em>는 행정의 기준, <em className="hion-hion-word">HiON</em>은 현장 운영의 기준</h2>
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
