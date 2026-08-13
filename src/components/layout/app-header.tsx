"use client";

import { Modal } from "@/components/common/modal";
import { useDashboardStore } from "@/store/dashboardStore";
import { Bell, ChevronDown, LogOut, Search, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FacilityRole } from "@/types/facility";

export function AppHeader() {
  const router = useRouter();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [actor, setActor] = useState<{ name: string; role: FacilityRole }>({ name: "김관리", role: "관리사무소 책임자" });
  const menuRef = useRef<HTMLDivElement>(null);
  const notifications = useDashboardStore((state) => state.notifications);
  const markRead = useDashboardStore((state) => state.markNotificationRead);
  const markAllRead = useDashboardStore((state) => state.markAllNotificationsRead);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  useEffect(() => {
    const close = (event: MouseEvent) => { if (!menuRef.current?.contains(event.target as Node)) { setNotificationOpen(false); setUserOpen(false); } };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setNotificationOpen(false); setUserOpen(false); } };
    document.addEventListener("mousedown", close);
    window.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", close); window.removeEventListener("keydown", escape); };
  }, []);
  useEffect(() => { void fetch("/api/facility/session").then((response) => response.json()).then((data: { session?: { name: string; role: FacilityRole } | null }) => { if (data.session) setActor(data.session); }).catch(() => undefined); }, []);

  return <>
    <header className="facility-header">
      <label className="facility-complex-select"><span>선택 단지</span><select aria-label="관리 단지 선택" defaultValue="hsp01"><option value="hsp01">HION 스마트파크</option></select></label>
      <form className="facility-global-search" role="search" onSubmit={(event) => { event.preventDefault(); router.push(`/assets${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`); }}>
        <Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="통합 검색" placeholder="자산, 작업지시, 민원, 문서 통합 검색" /><kbd>Enter</kbd>
      </form>
      <div className="facility-header-actions" ref={menuRef}>
        <div className="facility-menu-anchor">
          <button type="button" className="facility-icon-button" aria-label={`알림 ${unreadCount}개`} aria-expanded={notificationOpen} onClick={() => { setNotificationOpen((value) => !value); setUserOpen(false); }}><Bell size={19} />{unreadCount > 0 && <span className="facility-notification-badge">{unreadCount}</span>}</button>
          {notificationOpen && <section className="facility-dropdown facility-notification-menu" aria-label="알림 목록"><header><strong>알림</strong><button type="button" onClick={markAllRead}>모두 읽음 처리</button></header>{notifications.map((notification) => <button className={notification.read ? "is-read" : ""} type="button" key={notification.id} onClick={() => markRead(notification.id)}><span className={`facility-notification-dot is-${notification.severity}`} /><span><strong>{notification.title}</strong><small>{notification.description}</small><time>{notification.createdAt}</time></span></button>)}</section>}
        </div>
        <span className="facility-user-icon"><UserRound size={19} /></span>
        <div className="facility-menu-anchor">
          <button type="button" className="facility-user-button" aria-expanded={userOpen} onClick={() => { setUserOpen((value) => !value); setNotificationOpen(false); }}><span><strong>{actor.name}</strong><small>{actor.role}</small></span><ChevronDown size={16} /></button>
          {userOpen && <div className="facility-dropdown facility-user-menu"><Link href="/settings/users"><UserRound size={16} /> 계정과 권한</Link><button type="button" onClick={() => { setLogoutOpen(true); setUserOpen(false); }}><LogOut size={16} /> 로그아웃</button></div>}
        </div>
      </div>
    </header>
    {logoutOpen && <Modal title="로그아웃 확인" onClose={() => setLogoutOpen(false)}><div className="facility-modal-body"><ShieldCheck size={36} /><p>현재 데모 계정에서 로그아웃하시겠습니까?</p><div className="facility-button-row"><button className="facility-button secondary" type="button" onClick={() => setLogoutOpen(false)}>취소</button><button className="facility-button danger" type="button" onClick={async () => { await fetch("/api/facility/logout", { method: "POST" }); window.location.href = "/login"; }}>로그아웃</button></div></div></Modal>}
  </>;
}
