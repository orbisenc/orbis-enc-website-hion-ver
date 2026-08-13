import Link from "next/link";
import { redirect } from "next/navigation";

import { formatSeoulDateTime } from "@/lib/format/ko";
import { readAdminSession } from "@/server/auth/session";
import { agendaStateKo, listDemoAgendas } from "@/server/demo/agenda-campaign-store";
import { getApprovedAgendaCostImpact } from "@/server/demo/fee-store";
import { listAgendaAttachments } from "@/server/services/agenda-attachment-service";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ query?: string; state?: string }> }) {
  const session = await readAdminSession();
  if (!session) redirect("/admin/login");
  const filters = await searchParams;
  const allAgendas = listDemoAgendas(session.tenantId);
  const agendas = allAgendas.filter((agenda) => (!filters.query || agenda.titleKo.includes(filters.query)) && (!filters.state || agenda.state === filters.state));
  const attachmentCount = listAgendaAttachments(session.tenantId, "demo-agenda").length;
  const costReady = Boolean(getApprovedAgendaCostImpact(session.tenantId));

  return <>
    <div className="page-heading"><div><h1>안건 제작</h1><p className="muted">내용 작성부터 자료·비용 검토, 승인, 입주민 게시까지 버전 단위로 관리합니다.</p></div><Link className="btn btn-primary" href="/admin/agendas/demo-agenda">현재 안건 편집</Link></div>
    <section className="stats"><div className="stat"><span>전체 안건</span><strong>{allAgendas.length}건</strong></div><div className="stat"><span>게시 안건</span><strong>{allAgendas.filter((item) => item.state === "PUBLISHED").length}건</strong></div><div className="stat"><span>검토 필요</span><strong>{allAgendas.filter((item) => item.state === "IN_REVIEW").length}건</strong></div><div className="stat"><span>주민 공개 자료</span><strong>{attachmentCount}개</strong></div></section>
    <form className="filter-grid"><label>안건 검색<input className="field" name="query" defaultValue={filters.query ?? ""} placeholder="제목으로 검색" /></label><label>제작 상태<select className="field" name="state" defaultValue={filters.state ?? ""}><option value="">전체</option><option value="DRAFT">초안</option><option value="IN_REVIEW">검토 중</option><option value="APPROVED">승인</option><option value="PUBLISHED">게시됨</option></select></label><button className="btn">검색 적용</button><Link className="btn" href="/admin/agendas">초기화</Link></form>
    <div className="table-wrap"><table><thead><tr><th>안건</th><th>분류</th><th>제작 상태</th><th>게시 준비</th><th>담당자</th><th>버전</th><th>최근 변경</th><th>관리</th></tr></thead><tbody>{agendas.map((agenda) => <tr key={agenda.id}><td><strong>{agenda.titleKo}</strong><br/><small>{agenda.summaryKo}</small></td><td>{agenda.categoryKo}</td><td><span className="pill">{agendaStateKo(agenda.state)}</span></td><td>{attachmentCount > 0 && costReady ? "완료" : "확인 필요"}</td><td>{agenda.ownerKo}</td><td>{agenda.version}.0</td><td>{formatSeoulDateTime(agenda.updatedAt)}</td><td><Link className="btn" href={`/admin/agendas/${agenda.id}`}>제작 화면</Link></td></tr>)}</tbody></table></div>
    {agendas.length === 0 && <p className="empty-state">조건에 맞는 안건이 없습니다.</p>}
    <section className="card" style={{ marginTop: 20 }}><h2>제작 원칙</h2><ul><li>게시된 버전은 변경하지 않고 새 버전으로 수정합니다.</li><li>주민 화면에는 승인된 비용 영향과 공개 첨부 자료만 표시합니다.</li><li>검토자와 게시자는 상태 전이 및 처리 사유를 기록합니다.</li></ul></section>
  </>;
}
