import { OperationsPage } from "@/components/facility/operations-page";
import { documents } from "@/data/apartmentOperations";
export default function DocumentsRoute() { return <OperationsPage title="문서함" subtitle="자산·공사·작업지시·회의 문서의 버전과 공개 범위를 관리합니다." columns={[{key:"name",label:"문서명"},{key:"type",label:"유형"},{key:"related",label:"연결 대상"},{key:"version",label:"버전"},{key:"uploadedAt",label:"등록일"},{key:"visibility",label:"공개 범위"}]} rows={documents.map((item) => ({...item,status:item.visibility}))} />; }
