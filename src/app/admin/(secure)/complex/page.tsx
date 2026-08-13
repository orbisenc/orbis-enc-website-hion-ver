import { SectionPage } from "@/components/admin/section-page";
export default function Page() { return <SectionPage title="단지·동·세대 관리" description="2,000세대 구조를 서버 페이지 단위로 조회합니다." action="동 또는 세대 추가" headers={["동", "세대 범위", "세대 수", "상태"]} rows={Array.from({ length: 5 }, (_, i) => [`${101 + i}동`, "101호 ~ 400호", "400세대", "사용"])} />; }

