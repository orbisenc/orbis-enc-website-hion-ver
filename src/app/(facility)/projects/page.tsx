import { OperationsPage } from "@/components/facility/operations-page";
import { projects } from "@/data/apartmentOperations";
export default function ProjectsRoute() { return <OperationsPage title="공사·계약" subtitle="자산과 연결된 공사 범위, 예산, 업체, 진척과 완료 증빙을 관리합니다." columns={[{key:"name",label:"공사명"},{key:"asset",label:"관련 자산"},{key:"vendor",label:"업체"},{key:"budget",label:"예산"},{key:"progress",label:"진척"},{key:"status",label:"상태"}]} rows={projects} />; }
