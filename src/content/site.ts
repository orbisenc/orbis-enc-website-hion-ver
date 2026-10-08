export type NavItem = { label: string; href: string };

export const siteConfig = {
  name: "ORBIS D&C",
  legalName: "(주)오르비스이앤씨",
  brandLine: "Building the Digital Future",
  description:
    "오르비스디앤씨는 현황진단, BAM, 시설자산화, 통합운영, AI 예측관리까지 건물 운영 전 과정을 데이터 기반 체계로 전환합니다.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.orbisdnc.com",
  telephone: "010-2577-2447",
  fax: "02-6008-5189",
  address: "서울특별시 강남구 영동대로 405, 7층",
  email: null,
  representative: null,
  businessRegistrationNumber: null,
} as const;

export const navigation: NavItem[] = [
  { label: "HiON", href: "/" },
  { label: "솔루션", href: "/solutions" },
  { label: "학교·교육시설", href: "/industries/education" },
  { label: "회사소개", href: "/company" },
];

export const footerNavigation: NavItem[] = [
  ...navigation.slice(0, 3),
  { label: "회사소개", href: "/company" },
  { label: "문의", href: "/contact" },
  { label: "개인정보처리방침", href: "/privacy" },
];

export const deliveryStages = [
  {
    number: "01",
    title: "현황진단",
    description: "실제 현황과 도면의 차이를 확인하고 운영의 기준이 될 데이터를 정리합니다.",
  },
  {
    number: "02",
    title: "BAM 구축",
    description: "구조·건축·설비 정보를 유지관리용 3D 자산 모델로 구축합니다.",
  },
  {
    number: "03",
    title: "시설자산화",
    description: "시설과 공간에 자산 ID, 속성, 이력과 계획을 연결합니다.",
  },
  {
    number: "04",
    title: "통합운영",
    description: "자산·도면·점검·작업·비용을 하나의 정보원에서 관리합니다.",
  },
  {
    number: "05",
    title: "AI 예측관리",
    description: "이상징후와 위험 분석으로 점검·보수·교체 판단을 지원합니다.",
  },
] as const;

export const hionCapabilities = [
  { title: "3D 자산맵", description: "공간과 설비의 위치·관계를 직관적으로 확인합니다." },
  { title: "자산·이력관리", description: "설치부터 점검, 고장, 보수, 교체까지 이력을 연결합니다." },
  { title: "점검·작업관리", description: "현장 점검 결과를 후속 작업과 책임 흐름으로 이어갑니다." },
  { title: "다수 건물 통합 대시보드", description: "여러 건물의 운영 현황과 관리 항목을 한 흐름으로 파악합니다." },
  { title: "예산·교체계획", description: "상태와 이력에 근거해 우선순위와 계획 수립을 지원합니다." },
  { title: "AI 예측관리", description: "가용 데이터에서 이상징후와 위험 요인을 분석해 의사결정을 돕습니다." },
] as const;

export const legalConfig = {
  status: "REQUIRES_LEGAL_REVIEW" as const,
  approved: false,
  retentionPeriod: null,
  privacyOfficer: null,
  processors: null,
  lastReviewedAt: null,
};

export const launchApprovals = [
  "개인정보 보유·이용 기간과 파기 기준 법무 검토",
  "개인정보 보호책임자 및 문의 채널 확정",
  "개인정보 처리업무 수탁자와 국외 이전 여부 확인",
  "문의 전달 어댑터와 운영 담당자 연결",
  "대표자명·사업자등록번호 등 법정 표시사항 확정",
  "공개 이미지와 로고의 최신 사용 권한 재확인",
] as const;

export const inquiryTypes = [
  "HiON 도입",
  "현황진단·BAM 구축",
  "AI 예측관리",
  "기술 연계",
  "사업 제휴",
  "기타",
] as const;

export const facilityTypes = [
  "학교·교육시설",
  "공공시설",
  "업무·상업시설",
  "공동주택",
  "의료시설",
  "기타",
] as const;
