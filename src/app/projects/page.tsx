import type { Metadata } from "next";
import { Sigma } from "lucide-react";
import { MarketingPage } from "@/components/marketing/page-layout";
import { BreadcrumbJsonLd } from "@/components/marketing/shared";
import { pageMetadata } from "@/lib/marketing/metadata";

export const metadata: Metadata = pageMetadata({
  title: "프로젝트 실적 | ORBIS D&C",
  description: "디지털 트윈과 BIM 기반 주요 프로젝트 실적을 소개합니다.",
  path: "/projects",
});

const publicProjects = [
  "봉래산명소화 사업 BIM 및 디지털트윈 프리콘 타당성검토",
  "영월 봉래산 명소화 건설사업관리용역 (디지털트윈 BIM) 1차",
  "영월 봉래산 명소화 건설사업관리용역 (디지털트윈 BIM) 2차",
  "영월군 영월읍 영흥리 도시재생 활성화 계획 수립 용역-1차분",
  "기장 K-Culture Town 조성 기본구상 및 타당성조사 용역",
  "도시관리 플랫폼 구축 기본구상 수립 용역",
  "영월 계획공모형 지역관광개발(기반시설 부분) 기본 및 실시설계용역",
  "영월군 영월읍 영흥리 도시재생 활성화 계획 수립 용역-2차분",
  "영월 봉래산 명소화 건설사업관리용역 (디지털트윈 BIM) 3차",
  "영월 봉래산 명소화 건설사업관리용역 (디지털트윈 BIM) 4차",
];

const privateProjects = [
  "속초전망대 복합레저시설 BIM 설계 및 컨설팅",
  "인천검단3지구 경관보도교 3D BIM 설계 및 모델링 구축",
  "검단3구역 문화시설용지 3D BIM 설계 및 디지털트윈 구축",
  "속초전망대 컨셉디자인 BIM 설계 용역",
  "검단3구역 사회복지시설 패시브설계 및 3D BIM 설계",
  "삼척 정라지구 도시재생 버추얼트윈 기반 BIM 용역",
  "과천 지식정보타운 주유소 디지털 트윈 플랫폼 구축 및 PM",
  "수지 성복동 단독주택 버추얼트윈 구축 및 BIM 설계",
  "화성 농인션원 기숙사 철거 소송관련 BIM 구축 및 보상내역 검증 구축",
  "천안 타운하우스 사업부지 버추얼트윈 구축",
  "한전 울릉도 전력망 구축사업 버추얼트윈 구축 및 실증 플랫폼 구축",
];

const capabilityCards = [
  { code: "PLAN", title: "사업 기획 시각화", body: "3D 시각화로\n제안 경쟁력 강화" },
  { code: "BIM", title: "설계 검토 지원", body: "3D 데이터 기반\n검토·협의 지원" },
  { code: "DATA", title: "프로젝트 데이터 축적", body: "단계별 정보로\n운영 자산으로 연결" },
  { code: "HION", title: "운영 관리 확장", body: "AX-CM에서 HiON까지\n디지털 운영 체계 연계" },
];

function ProjectList({ title, label, items }: { title: string; label: string; items: string[] }) {
  return (
    <article className="projects-list-card">
      <header>
        <strong>{title}</strong>
        <span>{label}</span>
      </header>
      <ol>
        {items.map((item, index) => (
          <li key={item}>
            <span>{index + 1}</span>
            <p>{item}</p>
          </li>
        ))}
      </ol>
    </article>
  );
}

export default function ProjectsPage() {
  return (
    <MarketingPage>
      <BreadcrumbJsonLd items={[{ name: "홈", path: "/" }, { name: "Projects", path: "/projects" }]} />
      <section className="projects-performance-section projects-summary-section" aria-label="디지털 트윈 BIM 주요 프로젝트 실적">
        <div className="projects-performance-shell">
          <div className="projects-performance-top">
            <div className="projects-title-block">
              <h1>디지털 트윈·BIM 주요 프로젝트 실적</h1>
              <p>공공 10건 · 민간 11건 · 총 21건</p>
            </div>
          </div>

          <div className="projects-summary-row">
            <div className="projects-total-card">
              <div className="projects-sigma"><Sigma aria-hidden="true" /></div>
              <div>
                <span>디지털 트윈·BIM 총 수행 실적</span>
                <strong>21건</strong>
                <p>기획 · 설계 · 시공 · 운영 단계</p>
              </div>
            </div>
            <div className="projects-donut" aria-label="공공 48%, 민간 52%">
              <span>21<small>PROJECTS</small></span>
            </div>
            <div className="projects-legend">
              <p><i className="is-public" />공공 분야 <strong>10건</strong> <span>48%</span></p>
              <p><i className="is-private" />민간 분야 <strong>11건</strong> <span>52%</span></p>
            </div>
          </div>

          <div className="projects-capability-band">
            {capabilityCards.map((card) => (
              <article key={card.code}>
                <span>{card.code}</span>
                <div>
                  <strong>{card.title}</strong>
                  <p>{card.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="projects-performance-section projects-list-section" aria-label="프로젝트 수행 목록">
        <div className="projects-performance-shell projects-list-shell">
          <div className="projects-list-grid">
            <ProjectList title="공공 분야 | 10건" label="PUBLIC PROJECTS" items={publicProjects} />
            <ProjectList title="민간 분야 | 11건" label="PRIVATE PROJECTS" items={privateProjects} />
          </div>

          <div className="projects-bottom-bar">
            <span>21건 프로젝트 경험</span>
            <b>→</b>
            <strong>AX-CM · HiON 운영 플랫폼 확장</strong>
          </div>
        </div>
      </section>
    </MarketingPage>
  );
}
