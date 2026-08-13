import { OperationsPage } from "@/components/facility/operations-page";
import { facilityDemoUsers } from "@/data/facilityDemoUsers";
export default function UsersSettingsRoute() { return <OperationsPage title="사용자·역할" subtitle="단지별 사용자 역할과 허용 범위를 확인합니다. 역할 변경은 감사 기록 대상입니다." columns={[{key:"name",label:"이름"},{key:"email",label:"이메일"},{key:"role",label:"역할"},{key:"description",label:"접근 범위"},{key:"status",label:"상태"}]} rows={facilityDemoUsers.map((user) => ({...user,status:"활성"}))} />; }
