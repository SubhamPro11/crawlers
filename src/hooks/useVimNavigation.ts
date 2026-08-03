import { useState, useEffect } from "react";

export function useVimNavigation(
  itemCount: number,
  onSelect: (index: number) => void
) {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Reset index if itemCount changes
  useEffect(() => {
    if (selectedIndex >= itemCount) {
      setSelectedIndex(itemCount > 0 ? 0 : -1);
    }
  }, [itemCount, selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Ignore if typing in input, textarea, select, or contenteditable
      const active = document.activeElement;
      if (
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.tagName === "SELECT" ||
          (active as HTMLElement).isContentEditable)
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
      } else if (e.key === "Enter" && selectedIndex >= 0 && selectedIndex < itemCount) {
        e.preventDefault();
        onSelect(selectedIndex);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [itemCount, selectedIndex, onSelect]);

  return {
    selectedIndex,
    setSelectedIndex,
  };
}
