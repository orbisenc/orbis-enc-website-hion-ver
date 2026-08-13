import type { Metadata } from "next";
import Image from "next/image";
import { MarketingPage } from "@/components/marketing/page-layout";
import { BreadcrumbJsonLd, ButtonLink, FinalCta, PageHero, SectionHeading } from "@/components/marketing/shared";
import { pageMetadata } from "@/lib/marketing/metadata";

export const metadata: Metadata = pageMetadata({title:"현황진단·BAM·시설자산화·AI 예측관리 | ORBIS D&C",description:"현황진단에서 BAM 구축, 시설자산화, 통합운영과 AI 예측관리로 이어지는 ORBIS D&C의 5단계 실행 모델입니다.",path:"/solutions"});

const stages = [
  { title:"현황진단", problem:"기존 도면과 문서가 실제 현황과 다르거나, 설비 상태와 관리 기준이 한곳에 정리되어 있지 않습니다.", work:["기존 도면·문서 검토","실내 LiDAR 스캔","실외 드론 촬영","설비·마감 상태 조사"], outputs:"실제 현황 데이터, 불일치 목록, 주요 관리 요인", next:"확인된 현황을 BAM 모델링과 자산 분류의 기준으로 사용합니다." },
  { title:"BAM 구축", problem:"3D 모델이 있어도 유지관리 속성, 문서와 이력이 연결되지 않으면 현장에서 쓰기 어렵습니다.", work:["건축·구조 정보 모델링","기계·전기·소방·통신 정보 구성","외부·대지 정보 정리","공간과 설비 관계 설정"], outputs:"통합 3D BAM, 시스템별 보기, 도면·공간·사진·문서 연결", next:"BAM의 객체를 개별 시설자산으로 식별하고 운영 정보를 연결합니다.", definition:"BAM(Building Asset Model)은 실제 현황을 반영한 3D 모델에 시설 위치, 속성, 문서와 유지관리 정보를 연결한 운영용 디지털 자산입니다." },
  { title:"시설자산화", problem:"설비의 기본 정보와 점검·고장 이력이 파일과 담당자별로 분산되어 교체 판단의 연속성이 끊깁니다.", work:["자산 ID와 위치 등록","제조사·모델·사양 정리","설치일·보증·점검주기 연결","설치·점검·고장·보수·교체 이력 연결"], outputs:"시설자산 DB, 자산카드, 생애주기 이력, 교체·예산 계획", next:"정리된 자산을 점검, 작업, 비용과 조직별 운영 흐름에 연결합니다." },
  { title:"통합운영", problem:"자산, 도면, 점검, 작업, 업체와 비용이 서로 다른 도구에서 관리되어 전체 진행 상황을 보기 어렵습니다.", work:["자산·도면·문서 통합","점검과 후속 작업 연결","업체·비용·이슈 관계 구성","조직·사용자 기반 권한과 업무 흐름 설계"], outputs:"역할별 운영 화면, 통합 업무 흐름, 자산 중심 이력 조회", next:"축적된 운영 데이터를 활용해 위험과 관리 시점을 분석합니다." },
  { title:"AI 예측관리", problem:"고장 후 대응과 경험 중심 판단만으로는 제한된 예산 안에서 점검·교체 우선순위를 정하기 어렵습니다.", work:["자산 속성과 유지관리 이력 분석","가용한 BMS·센서·환경 데이터 분석","공사 변경과 이슈 이력 검토","이상징후와 서비스 수명 위험 평가"], outputs:"위험 신호, 점검·교체 시점 검토 정보, 관리 포인트 추천", next:"담당자의 실행 결과를 다시 데이터에 반영해 다음 분석과 계획을 개선합니다.", definition:"AI 분석은 의사결정을 지원하며 특정 고장 방지, 수명 또는 운영 결과를 보장하지 않습니다." },
];
const stageImages = [
  ["/images/orbis/planning-digital-model.jpg", "현황과 계획 정보를 디지털 모델로 검토하는 개념 이미지"],
  ["/images/orbis/bim-design.jpg", "건물 모델과 설계 정보를 함께 검토하는 BAM 개념 이미지"],
  ["/images/gurye-school-cutaway.png", "건물 공간과 시설자산의 위치 관계를 보여 주는 설명 이미지"],
  ["/images/orbis/operations-digital-building.jpg", "건물 운영 데이터를 통합 확인하는 개념 이미지"],
  ["/images/orbis/building-digital-twin.jpg", "건물 구조와 설비 정보를 겹쳐 표현한 디지털 트윈 개념 이미지"],
];

export default function SolutionsPage(){return <MarketingPage><BreadcrumbJsonLd items={[{name:"홈",path:"/"},{name:"솔루션",path:"/solutions"}]}/><PageHero eyebrow="END-TO-END DELIVERY" title="현황진단부터 예측관리까지, 하나로 연결된 5단계 실행 모델" body="각 단계의 결과가 다음 단계의 입력이 되어 현장 정보가 일회성 산출물이 아닌 운영 자산으로 남습니다." media={{src:"/images/orbis/planning-digital-model.jpg",alt:"도시와 건물의 계획 정보를 디지털 모델로 통합 검토하는 개념 이미지",caption:"기획·현황진단 개념 · 회사소개서 제공 이미지",priority:true}}><ButtonLink href="/contact">우리 기관의 시작 단계 상담</ButtonLink></PageHero><section className="section"><div className="marketing-container"><SectionHeading eyebrow="DELIVERY MODEL" title="단계마다 문제, 수행 내용, 산출물과 다음 연결을 분명하게"/><ol className="solution-stage-list">{stages.map((stage,index)=><li className="solution-stage" key={stage.title}><div className="stage-title"><span>0{index+1}</span><h2>{stage.title}</h2></div><div className="stage-fields"><figure className="stage-media"><Image src={stageImages[index][0]} alt={stageImages[index][1]} fill sizes="(max-width:760px) 100vw,65vw"/><figcaption>제공 자료 기반 서비스 개념 이미지</figcaption></figure><article><h3>고객의 현재 문제</h3><p>{stage.problem}</p></article><article><h3>ORBIS D&amp;C 수행</h3><ul>{stage.work.map(item=><li key={item}>{item}</li>)}</ul></article><article><h3>산출물</h3><p>{stage.outputs}</p></article><article><h3>다음 단계 연결</h3><p>{stage.next}</p></article>{stage.definition?<p className="stage-definition">{stage.definition}</p>:null}</div></li>)}</ol></div></section><FinalCta title="우리 기관에 맞는 시작 단계를 함께 정리합니다" body="현재 보유한 도면과 데이터, 관리 범위를 바탕으로 필요한 첫 단계를 검토합니다." label="우리 기관의 시작 단계 상담"/></MarketingPage>}
