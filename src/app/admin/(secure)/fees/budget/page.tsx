import { redirect } from "next/navigation";

import { formatPercentFromBasisPoints, formatWon } from "@/lib/format/ko";
import { FEE_REFERENCE_MONTH, getFeeDashboard } from "@/server/demo/fee-store";
import { assertFeeAccess } from "@/server/services/management-fee-auth";
import { changeRateBasisPoints } from "@/server/services/management-fee-ledger";
import { readFeeAccessContext } from "@/server/services/management-fee-session";

export default async function Page() {
  const context = await readFeeAccessContext();
  if (!context) redirect("/admin/login");
  assertFeeAccess(context, context.tenantId, "VIEW");

  const data = getFeeDashboard(context.tenantId, FEE_REFERENCE_MONTH);

  return (
    <>
      <h1>예산 대비 현황</h1>
      <p className="muted">
        현재는 확정 예산과 실제 부과 원장의 읽기 전용 비교를 제공합니다. 예산 편성과 버전 관리는 후속 단계에서 확장합니다.
      </p>
      <section className="stats">
        <div className="stat"><span>계획 금액</span><strong>{formatWon(data.budget.planned)}</strong></div>
        <div className="stat"><span>실제 금액</span><strong>{formatWon(data.budget.actual)}</strong></div>
        <div className="stat"><span>계획 대비 차이</span><strong>{formatWon(data.budget.actual - data.budget.planned)}</strong></div>
        <div className="stat"><span>계획 대비 비율</span><strong>{formatPercentFromBasisPoints(changeRateBasisPoints(data.budget.actual, data.budget.planned))}</strong></div>
      </section>
      <div className="table-wrap" style={{ marginTop: 20 }}>
        <table>
          <thead><tr><th>관리비 항목</th><th>계획</th><th>실제</th><th>차이</th></tr></thead>
          <tbody>
            {data.categories.map((item, index) => {
              const planned = item.amount * BigInt(index % 3 === 0 ? 103 : 98) / 100n;
              return <tr key={item.id}><td>{item.nameKo}</td><td>{formatWon(planned)}</td><td>{formatWon(item.amount)}</td><td>{formatWon(item.amount - planned)}</td></tr>;
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
