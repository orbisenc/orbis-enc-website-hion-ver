"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef } from "react";

export function Modal({ title, children, onClose, size = "default" }: { title: string; children: React.ReactNode; onClose(): void; size?: "default" | "large" }) {
  const titleId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onCloseRef.current(); };
    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>("[data-autofocus], input, select, textarea, button, a")?.focus());
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  return <div className="facility-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
    <section ref={dialogRef} className={`facility-modal is-${size}`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <header><h2 id={titleId}>{title}</h2><button type="button" className="facility-icon-button" aria-label="창 닫기" onClick={onClose}><X size={18} /></button></header>
      {children}
    </section>
  </div>;
}
