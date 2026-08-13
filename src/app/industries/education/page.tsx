import type { Metadata } from "next";
import Image from "next/image";
import { MarketingPage } from "@/components/marketing/page-layout";
import { BreadcrumbJsonLd, ButtonLink, FinalCta, PageHero, SectionHeading } from "@/components/marketing/shared";
import { pageMetadata } from "@/lib/marketing/metadata";

export const metadata: Metadata = pageMetadata({title:"학교시설 자산관리·AI 예측관리 HiON | ORBIS D&C",description:"학교의 건축·전기·기계·소방·통신 설비를 3D 자산과 이력으로 연결해 예방 중심 시설관리를 지원합니다.",path:"/industries/education"});
const problems=["도면과 실제 현황 불일치","설비 정보 분산","고장 이후 긴급복구와 수업 차질","학교별 점검·보고 형식 불일치","교체·예산 우선순위 부족"];
const faqs=[
  ["기존 도면이 없어도 가능한가요?","가능 여부와 필요한 작업 범위는 현장 여건에 따라 달라집니다. 보유 자료를 먼저 검토하고, 필요한 경우 현황조사와 스캔을 통해 운영 기준이 될 정보를 구성합니다."],
  ["학교 운영 중에도 현황조사가 가능한가요?","수업과 이용 동선을 우선 고려해 조사 구역과 시간을 협의할 수 있습니다. 실제 진행 방식은 시설별 접근 조건과 안전 기준을 검토한 뒤 정합니다."],
  ["여러 학교를 동시에 관리할 수 있나요?","다수 시설을 공통 자산 기준으로 구성하는 방안을 검토할 수 있습니다. 조직별 조회 범위와 권한, 학교별 데이터 구조는 도입 범위 협의가 필요합니다."],
  ["기존 시설관리 시스템과 연계할 수 있나요?","기존 시스템의 API, 데이터 형식, 보안·권한 정책을 확인한 뒤 연계 가능 범위를 판단합니다. 특정 연계는 사전 기술 검토 없이 보장하지 않습니다."],
  ["데이터의 사용 권한은 어떻게 관리하나요?","조직과 사용자 역할에 따라 조회·등록·변경 범위를 구분하는 방식으로 설계합니다. 세부 권한 체계와 데이터 보관 정책은 기관의 운영 기준에 맞춰 검토합니다."],
];

export default function EducationPage(){return <MarketingPage><BreadcrumbJsonLd items={[{name:"홈",path:"/"},{name:"학교·교육시설",path:"/industries/education"}]}/><PageHero eyebrow="PRIMARY INDUSTRY · EDUCATION" title="학교시설 업무, 더 빠르고 더 안전하게" body="학교의 건축·전기·기계·소방·통신 설비를 3D 자산으로 연결하고 점검부터 교체까지 이력을 축적해 사후보수를 예방 중심의 시설관리로 전환합니다." media={{src:"/images/gurye-school-cutaway.png",alt:"교실과 체육관, 기계실의 공간과 설비 관계를 보여 주는 학교 건물 단면 설명 이미지",caption:"학교 시설자산 연결 설명 이미지",priority:true}}><ButtonLink href="/contact?type=education">학교시설 도입 상담</ButtonLink></PageHero>
<section className="section"><div className="marketing-container"><SectionHeading eyebrow="CURRENT CHALLENGES" title="학교마다 다른 정보와 업무를 하나의 관리 기준으로"/><div className="problem-grid">{problems.slice(0,4).map((item,index)=><article key={item}><span>0{index+1}</span><h3>{item}</h3></article>)}</div><p className="ai-note">추가 핵심 과제 · {problems[4]}</p></div></section>
<section className="section section-soft"><div className="marketing-container education-showcase"><div className="education-image"><Image src="/images/gurye-school-cutaway.png" alt="학교의 교실, 체육관, 계단과 기계실 설비를 함께 표현한 건물 단면 설명 이미지" fill sizes="(max-width:1050px) 100vw,55vw"/><p className="image-note">자산 등록 개념을 설명하기 위한 이미지이며, 특정 학교의 구축 실적을 의미하지 않습니다.</p></div><div className="education-copy"><p className="eyebrow eyebrow-light">ASSET REGISTRY</p><h2>모든 설치물을 운영 가능한 자산으로</h2><p>건축, 전기, 기계, 소방, 통신 설비마다 자산 ID를 부여하고 위치, 속성, 점검주기와 이력을 연결합니다.</p></div></div></section>
<section className="section section-navy"><div className="marketing-container"><SectionHeading eyebrow="LIFECYCLE" title="설치부터 교체까지 끊기지 않는 자산 이력"/><ol className="lifecycle">{["설치","점검","고장","보수","교체"].map(item=><li key={item}>{item}</li>)}</ol></div></section>
<section className="section"><div className="marketing-container"><SectionHeading eyebrow="FROM REACTIVE TO PREDICTIVE" title="긴급복구 중심에서 예방 중심으로" body="상태와 이력을 축적해 점검·보수·교체의 우선순위를 검토할 수 있는 근거를 만듭니다."/><div className="comparison-panel"><div className="comparison-side before"><span>사후 대응</span><ol><li>고장 접수</li><li>긴급복구</li><li>기록 분산</li></ol></div><div className="comparison-arrow" aria-hidden="true">→</div><div className="comparison-side after"><span>예측 관리</span><ol><li>상태 확인</li><li>위험 검토</li><li>계획정비</li><li>이력 축적</li></ol></div></div><p className="ai-note">분석은 담당자의 판단을 지원하며 시설 상태, 데이터 범위와 이력에 따라 결과가 달라질 수 있습니다.</p></div></section>
<section className="section section-soft"><div className="marketing-container"><SectionHeading eyebrow="THREE-STAGE ADOPTION" title="현황에 맞춰 단계적으로 도입"/><div className="adoption-grid">{[["01","3D 모델 데이터 구축","공간과 설비의 실제 현황을 디지털 기준으로 구성합니다."],["02","설비 객체 데이터 정리","설비별 ID, 속성, 문서와 관리 기준을 연결합니다."],["03","점검 이력 취합·분석","운영 결과를 축적하고 다음 점검과 교체 계획에 활용합니다."]].map(([n,t,b])=><article key={n}><span>{n}</span><h3>{t}</h3><p>{b}</p></article>)}</div></div></section>
<section className="section"><div className="marketing-container"><SectionHeading eyebrow="APPLICABLE ORGANIZATIONS" title="교육시설을 계획하고 운영하는 조직을 위해"/><div className="role-grid">{["교육청·관리기관","대학 캠퍼스","학교법인","단위학교"].map(item=><article key={item}><h3>{item}</h3></article>)}</div></div></section>
<section className="section section-soft"><div className="marketing-container"><SectionHeading eyebrow="FAQ" title="도입 전 자주 묻는 질문"/><div className="faq-list">{faqs.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div></div></section>
<FinalCta title="도면이 정리되지 않았어도 현황진단부터 시작할 수 있습니다." body="학교 운영 여건과 보유 자료를 확인해 적절한 시작 범위를 함께 검토합니다." href="/contact?type=education" label="학교시설 도입 상담"/></MarketingPage>}
