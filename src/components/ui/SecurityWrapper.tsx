"use client";

import { useEffect } from "react";

export function SecurityWrapper() {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F12
      if (e.key === "F12") {
        e.preventDefault();
      }
      
      // Prevent Ctrl+Shift+I (DevTools), Ctrl+Shift+J, Ctrl+U (View Source), Ctrl+C (Copy)
      if (e.ctrlKey) {
        if (e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) {
          e.preventDefault();
        }
        if (e.key === "U" || e.key === "u" || e.key === "S" || e.key === "s" || e.key === "P" || e.key === "p") {
          e.preventDefault();
        }
      }
      // Mac specific CMD equivalents
      if (e.metaKey) {
        if (e.altKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j")) {
            e.preventDefault();
        }
        if (e.key === "U" || e.key === "u" || e.key === "S" || e.key === "s") {
            e.preventDefault();
        }
      }
    };

    // Attempt to block dragging of images/text
    const handleDragStart = (e: DragEvent) => {
        e.preventDefault();
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("dragstart", handleDragStart);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("dragstart", handleDragStart);
    };
  }, []);

  return null;
}
