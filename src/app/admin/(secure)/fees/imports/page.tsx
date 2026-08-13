import { redirect } from "next/navigation";
import { FeeImportWizard } from "@/components/admin/fee-import-wizard";
import { feeImportStatusKo, feeImportTypeKo } from "@/lib/fees/presentation";
import { formatSeoulDateTime, formatWon } from "@/lib/format/ko";
import { FEE_REFERENCE_MONTH, listFeeImports, listFeePeriods } from "@/server/demo/fee-store";
import { assertFeeAccess } from "@/server/services/management-fee-auth";
import { readFeeAccessContext } from "@/server/services/management-fee-session";
export const dynamic="force-dynamic";
export default async function Page(){const context=await readFeeAccessContext();if(!context)redirect("/admin/login");assertFeeAccess(context,context.tenantId,"IMPORT");const period=listFeePeriods(context.tenantId).find(item=>item.referenceMonth===FEE_REFERENCE_MONTH)!;const imports=listFeeImports(context.tenantId);return <><h1>데이터 등록</h1><p className="muted">기존 관리사무소 시스템의 부과 또는 수납·환급 CSV를 검증하고 확정합니다. 오류가 있는 묶음은 일부만 등록하지 않습니다.</p><FeeImportWizard periodId={period.id} referenceMonth={period.referenceMonth}/><section className="card" style={{marginTop:20}}><h2>등록 이력</h2>{imports.length===0?<p className="empty-state">이번 시연 세션에 등록한 CSV가 없습니다.</p>:<div className="table-wrap"><table><thead><tr><th>파일</th><th>유형</th><th>상태</th><th>행 수</th><th>원본 합계</th><th>계산 합계</th><th>등록자·시각</th></tr></thead><tbody>{imports.map(item=><tr key={item.id}><td>{item.filename}</td><td>{feeImportTypeKo(item.type)}</td><td>{feeImportStatusKo(item.status)}</td><td>{item.rowCount}</td><td>{formatWon(item.sourceTotal)}</td><td>{formatWon(item.calculatedTotal)}</td><td>{item.uploadedBy}<br/><small>{formatSeoulDateTime(item.uploadedAt)}</small></td></tr>)}</tbody></table></div>}</section></>}
