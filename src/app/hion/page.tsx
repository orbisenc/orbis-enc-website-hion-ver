import type { Metadata } from "next";
import { hionCapabilities } from "@/content/site";
import { MarketingPage } from "@/components/marketing/page-layout";
import { BreadcrumbJsonLd, ButtonLink, CapabilityGrid, FinalCta, PageHero, SectionHeading } from "@/components/marketing/shared";
import { pageMetadata } from "@/lib/marketing/metadata";

export const metadata: Metadata = pageMetadata({
  title: "HiON Building Operating System | ORBIS D&C",
  description: "건물의 공간, 설비, 도면, 점검, 작업과 비용 데이터를 하나의 기준으로 연결하는 HiON을 소개합니다.",
  path: "/hion",
});

const roles = [
  ["발주처·관리기관", "다수 시설의 현황과 계획을 공통 기준으로 파악합니다."],
  ["시설관리 담당자", "점검, 고장, 작업과 설비 이력을 일관되게 관리합니다."],
  ["현장기술자·협력업체", "필요한 자산 정보와 작업 범위를 현장에서 확인합니다."],
  ["경영진·의사결정자", "상태와 이력에 근거한 예산·교체 판단 자료를 확인합니다."],
];
const connected = [
  ["자산·공간", "건물, 층, 실, 설비의 관계"], ["문서·도면", "자산에 연결된 도면과 운영 문서"],
  ["업무·점검", "점검 결과와 후속 작업"], ["고장·보수·교체 이력", "생애주기 전체의 변경 기록"],
  ["업체와 비용", "작업 주체와 비용 정보"], ["이상·민원", "운영 중 발견된 문제와 영향"], ["외부 시스템", "검토된 범위 안에서 연계되는 운영 데이터"],
];

export default function HionPage() {
  return <MarketingPage>
    <BreadcrumbJsonLd items={[{name:"홈",path:"/"},{name:"HiON",path:"/hion"}]} />
    <PageHero eyebrow="HiON · BUILDING OPERATING SYSTEM" title="건물의 모든 운영 정보를 하나로 연결하는 Building Operating System" body="HiON은 시설관리 앱 하나를 더하는 것이 아니라, 공간·설비·문서·작업·비용이 같은 자산 기준으로 이어지게 하는 건물 운영 체계입니다." media={{src:"/images/orbis/home-building-operations-20260813.png",alt:"건물의 구조와 설비, 디지털 운영 화면을 함께 보여 주는 통합운영 이미지",caption:"건물 자산과 운영 데이터를 연결한 통합운영 이미지",priority:true}}><ButtonLink href="/contact">기술 연계 및 도입 상담 요청</ButtonLink></PageHero>
    <section className="section"><div className="marketing-container content-grid"><p className="content-aside">PRODUCT DEFINITION</p><div><p className="prose-lead">현장의 자산을 디지털 기준으로 만들고, 운영 과정에서 발생하는 정보를 그 기준에 계속 축적합니다.</p><p>HiON은 발주처와 관리기관, 시설관리 담당자, 현장 기술자와 의사결정자가 필요한 정보를 각자의 업무 맥락에서 확인하도록 돕습니다. 한 번 만든 모델을 보여 주는 데 그치지 않고, 실제 점검과 작업 결과가 다시 자산 데이터로 돌아오는 구조를 지향합니다.</p></div></div></section>
    <section className="section section-soft"><div className="marketing-container overview-grid"><SectionHeading eyebrow="SIX CAPABILITIES" title="자산을 중심으로 이어지는 여섯 가지 운영 기능" body={`HiON은 ${hionCapabilities.length}개의 핵심 영역을 한 흐름으로 연결합니다.`}/><CapabilityGrid /></div></section>
    <section className="section"><div className="marketing-container"><SectionHeading eyebrow="FOR EVERY ROLE" title="같은 데이터, 역할에 맞는 판단"/><div className="role-grid">{roles.map(([title,body])=><article key={title}><h3>{title}</h3><p>{body}</p></article>)}</div></div></section>
    <section className="section section-soft"><div className="marketing-container"><SectionHeading eyebrow="SINGLE SOURCE OF TRUTH" title="흩어진 운영 정보를 자산 기준으로 연결" body="원본의 출처와 업무 권한을 구분하면서도, 필요한 맥락은 끊기지 않게 구성합니다."/><div className="info-grid">{connected.map(([title,body])=><article key={title}><h3>{title}</h3><p>{body}</p></article>)}</div></div></section>
    <section className="section section-navy"><div className="marketing-container"><SectionHeading eyebrow="CLOSED LOOP" title="현장 결과가 다음 계획을 개선하는 닫힌 고리"/><ol className="loop-flow"><li>현장 점검</li><li className="loop-arrow" aria-hidden="true">→</li><li>결과 기록</li><li className="loop-arrow" aria-hidden="true">→</li><li>데이터 갱신</li><li className="loop-arrow" aria-hidden="true">→</li><li>AI 분석</li><li className="loop-arrow" aria-hidden="true">→</li><li>계획 개선</li></ol></div></section>
    <section className="section"><div className="marketing-container content-grid"><p className="content-aside">RESPONSIBLE AI</p><div><p className="prose-lead">AI는 사람의 판단을 지원하고, 최종 결정을 대신하지 않습니다.</p><p>분석 결과의 품질은 확보된 데이터의 품질, 수집 범위와 누적 이력에 따라 달라집니다. HiON은 가능한 근거를 함께 제시해 담당자가 점검·보수·교체 시점을 검토하도록 돕고, 특정 결과나 고장 방지를 보장하지 않습니다.</p></div></div></section>
    <FinalCta title="현재 운영 데이터가 어떻게 연결될 수 있는지 확인해 보세요" body="시설 현황과 필요한 연계 범위를 함께 검토합니다." label="기술 연계 및 도입 상담 요청" />
  </MarketingPage>;
}
