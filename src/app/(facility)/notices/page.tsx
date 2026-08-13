import { OperationsPage } from "@/components/facility/operations-page";
import { notices } from "@/data/apartmentOperations";
export default function NoticesRoute() { return <OperationsPage title="공지사항" subtitle="대상, 게시 기간, 중요도와 읽음 상태를 관리합니다." columns={[{key:"title",label:"제목"},{key:"audience",label:"대상"},{key:"period",label:"게시 기간"},{key:"importance",label:"중요도"},{key:"status",label:"상태"}]} rows={notices.map((item) => ({...item,name:item.title}))} />; }
