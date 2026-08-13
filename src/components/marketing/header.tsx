"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { navigation } from "@/content/site";

function isCurrent(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

export function MarketingHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
    focusable?.[0]?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <header className="marketing-header">
      <div className="marketing-container header-inner">
        <Link className="wordmark" href="/" aria-label="ORBIS D&C 홈" onClick={(event) => {
          event.preventDefault();
          window.location.assign("/");
        }}>
          <Image className="brand-logo" src="/images/orbis/orbis-dnc-logo.png" width={150} height={74} alt="" priority />
        </Link>
        <nav className="desktop-nav" aria-label="주요 메뉴">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} aria-current={isCurrent(pathname, item.href) ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>
        <Link className="header-cta" href="/contact">도입 상담하기 <span aria-hidden="true">↗</span></Link>
        <button
          ref={triggerRef}
          className="menu-trigger"
          type="button"
          aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>
      {open ? (
        <div className="mobile-nav-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            setOpen(false);
            triggerRef.current?.focus();
          }
        }}>
          <div id="mobile-navigation" ref={panelRef} className="mobile-nav-panel" role="dialog" aria-modal="true" aria-label="모바일 메뉴">
            <button className="mobile-close" type="button" onClick={() => { setOpen(false); triggerRef.current?.focus(); }} aria-label="메뉴 닫기">
              <X aria-hidden="true" />
            </button>
            <nav aria-label="모바일 주요 메뉴">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)} aria-current={isCurrent(pathname, item.href) ? "page" : undefined}>
                  <span>{item.label}</span><span aria-hidden="true">↗</span>
                </Link>
              ))}
              <Link className="mobile-contact" href="/contact" onClick={() => setOpen(false)}>도입 상담하기</Link>
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
