import type { FacilityRole } from "@/types/facility";

export interface FacilityDemoUser { id: string; role: FacilityRole; name: string; email: string; description: string }

export const facilityDemoUsers: FacilityDemoUser[] = [
  { id: "platform-admin", role: "플랫폼 관리자", name: "오르비서비스 관리자", email: "admin@hion.local", description: "전체 단지와 플랫폼 설정" },
  { id: "manager", role: "관리사무소 책임자", name: "김관리", email: "manager@hion.local", description: "단지 운영과 승인" },
  { id: "technician", role: "시설 담당자", name: "박기술", email: "technician@hion.local", description: "점검과 작업지시 수행" },
  { id: "committee", role: "입주자대표회의", name: "이대표", email: "committee@hion.local", description: "승인된 근거 읽기" },
  { id: "vendor", role: "협력업체", name: "한빛시설관리", email: "vendor@hion.local", description: "배정 작업과 증빙 등록" },
  { id: "resident", role: "입주민", name: "정입주", email: "resident@hion.local", description: "공지·본인 민원·공개정보" },
];
