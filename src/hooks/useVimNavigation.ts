import { useState, useEffect } from "react";

export function useVimNavigation(
  itemCount: number,
  onSelect: (index: number) => void
) {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const effectiveIndex = itemCount <= 0 ? -1 : (selectedIndex >= itemCount ? 0 : selectedIndex);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;

      // 1. Ignore if user is focused on an interactive element (input, textarea, select, a, button, summary, or element with tabindex)
      if (
        active &&
        active !== document.body &&
        active !== document.documentElement &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.tagName === "SELECT" ||
          active.tagName === "A" ||
          active.tagName === "BUTTON" ||
          active.tagName === "SUMMARY" ||
          (active as HTMLElement).isContentEditable ||
          active.hasAttribute("tabindex"))
      ) {
        return;
      }

      // 2. Ignore if modifier keys are pressed (e.g. Ctrl+K, Meta+K)
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      if (itemCount <= 0) return;

      if (e.key === "j" || e.key === "J") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < itemCount - 1 ? prev + 1 : 0));
      } else if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : itemCount - 1));
      } else if (e.key === "Enter" && effectiveIndex >= 0 && effectiveIndex < itemCount) {
        e.preventDefault();
        onSelect(effectiveIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [itemCount, effectiveIndex, onSelect]);

  return {
    selectedIndex: effectiveIndex,
    setSelectedIndex,
  };
}
