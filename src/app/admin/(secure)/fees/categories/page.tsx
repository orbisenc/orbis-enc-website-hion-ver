import { redirect } from "next/navigation";
import { FeeCategoryManager } from "@/components/admin/fee-category-manager";
import { feeCategories } from "@/server/demo/fee-store";
import { assertFeeAccess } from "@/server/services/management-fee-auth";
import { readFeeAccessContext } from "@/server/services/management-fee-session";

export default async function Page() {
  const context=await readFeeAccessContext(); if(!context) redirect("/admin/login"); assertFeeAccess(context,context.tenantId,"VIEW");
  return <><h1>관리비 항목</h1><p className="muted">단지별 기본 항목의 한국어 명칭·설명·순서·대시보드 포함 여부를 설정합니다. 확정 기준월에서 사용한 항목은 삭제하지 않고 비활성화하여 이력을 보존합니다.</p><FeeCategoryManager initialCategories={feeCategories}/></>;
}
