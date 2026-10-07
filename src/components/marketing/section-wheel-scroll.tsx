"use client";

import { useEffect, useRef } from "react";

const LOCK_MS = 760;
const MIN_WHEEL_DELTA = 12;
const SECTION_SELECTOR = "main > section, .marketing-footer";

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
      if (now < lockedUntilRef.current) return;

      const sections = getVisibleSections(container);
      if (sections.length < 2) return;

      const currentIndex = getCurrentSectionIndex(container, sections);
      const targetIndex = Math.min(Math.max(currentIndex + direction, 0), sections.length - 1);
      if (targetIndex === currentIndex) return;

      lockedUntilRef.current = now + LOCK_MS;
      container.scrollTo({
        top: getScrollTarget(container, sections[targetIndex]),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaY) < MIN_WHEEL_DELTA) return;
      event.preventDefault();
      scrollToSection(event.deltaY > 0 ? 1 : -1);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isEditing =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement ||
        activeElement?.getAttribute("contenteditable") === "true";

      if (isEditing) return;

      if (event.key === "ArrowDown" || event.key === "PageDown" || event.key === " ") {
        event.preventDefault();
        scrollToSection(1);
      }

      if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        scrollToSection(-1);
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      container.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return null;
}
