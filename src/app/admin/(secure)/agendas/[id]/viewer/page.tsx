import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { SceneSaveButton } from "@/components/admin/scene-save-button";
import { ParkingViewer } from "@/components/viewer3d/parking-viewer";
import { readAdminSession } from "@/server/auth/session";
import { getDemoAgendaRecord } from "@/server/demo/agenda-campaign-store";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const session = await readAdminSession();
  if (!session) redirect("/admin/login");
  const { id } = await params;
  let agenda;
  try { agenda = getDemoAgendaRecord(session.tenantId, id); } catch { notFound(); }
  return <><p className="muted"><Link href={`/admin/agendas/${id}`}>안건 제작</Link> / 3D 장면</p><h1>3D 장면 구성</h1><p className="muted">초기 카메라, 회전 중심, 변경 전후 상태와 한국어 핫스폿을 확인합니다. 3D를 사용할 수 없는 환경에는 동일 내용을 담은 대체 이미지가 표시됩니다.</p><ParkingViewer /><section className="card" style={{ marginTop: 18 }}><h2>게시 필수 확인</h2><ul className="check-list"><li className="done">완료 · 초기 카메라와 회전 중심</li><li className="done">완료 · 변경 전후 상태</li><li className="done">완료 · 한국어 핫스폿</li><li className="done">완료 · 대체 이미지와 설명</li></ul><p className="muted">현재 안건 {agenda.version}.0판에 연결됩니다.</p><SceneSaveButton agendaId={id} /></section></>;
}
