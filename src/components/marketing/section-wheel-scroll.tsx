"use client";

import { useEffect, useRef } from "react";

const LOCK_MS = 760;
const MIN_WHEEL_DELTA = 8;
const SECTION_SELECTOR = "main > section, .marketing-footer";
const DESKTOP_QUERY = "(min-width: 1051px)";
const EDITABLE_SELECTOR = "input, textarea, select, [contenteditable='true']";

function getVisibleSections(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(SECTION_SELECTOR)).filter((element) => {
    const style = window.getComputedStyle(element);
    return style.display !== "none" && element.offsetHeight > 0;
  });
}

function getScrollTarget(container: HTMLElement, section: HTMLElement) {
  const headerOffset = Number.parseFloat(window.getComputedStyle(container).scrollPaddingTop || "0") || 0;
  return Math.max(0, section.offsetTop - headerOffset);
}

function getCurrentSectionIndex(container: HTMLElement, sections: HTMLElement[]) {
  const currentTop = container.scrollTop;
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  sections.forEach((section, index) => {
    const distance = Math.abs(getScrollTarget(container, section) - currentTop);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
}

export function SectionWheelScroll() {
  const lockedUntilRef = useRef(0);

  useEffect(() => {
    const container = document.querySelector<HTMLElement>(".marketing-site");
    if (!container) return;

    const scrollToSection = (direction: 1 | -1) => {
      const now = window.performance.now();
      if (now < lockedUntilRef.current) return true;

      const sections = getVisibleSections(container);
      if (sections.length < 2) return false;

      const currentIndex = getCurrentSectionIndex(container, sections);
      const targetIndex = Math.min(Math.max(currentIndex + direction, 0), sections.length - 1);
      if (targetIndex === currentIndex) return false;

      lockedUntilRef.current = now + LOCK_MS;
      container.scrollTo({
        top: getScrollTarget(container, sections[targetIndex]),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
      return true;
    };

    const handleWheel = (event: WheelEvent) => {
      const target = event.target;
      const deltaY = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);

      if (
        event.ctrlKey ||
        !window.matchMedia(DESKTOP_QUERY).matches ||
        Math.abs(deltaY) < MIN_WHEEL_DELTA ||
        Math.abs(event.deltaX) > Math.abs(deltaY) ||
        (target instanceof Element && target.closest(EDITABLE_SELECTOR))
      ) {
        return;
      }

      const handled = scrollToSection(deltaY > 0 ? 1 : -1);
      if (!handled) return;

      event.preventDefault();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!window.matchMedia(DESKTOP_QUERY).matches) return;

      const activeElement = document.activeElement;
      const isEditing =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement ||
        activeElement?.getAttribute("contenteditable") === "true";

      if (isEditing) return;

      if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") {
        if (scrollToSection(1)) event.preventDefault();
      }

      if (event.key === "ArrowUp" || event.key === "PageUp") {
        if (scrollToSection(-1)) event.preventDefault();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel, { capture: true });
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return null;
}
