import { useRef, useCallback } from "react";

/**
 * Returns event handlers that detect horizontal swipe (touch) and drag (mouse).
 * Mouse events are tracked on window so fast drags outside the element still register.
 */
export function useSwipe(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  threshold = 50
) {
  const startX = useRef<number | null>(null);
  const dragging = useRef(false);

  // ── Touch ──────────────────────────────────────────────
  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current === null) return;
    const delta = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(delta) >= threshold) {
      delta < 0 ? onSwipeLeft() : onSwipeRight();
    }
    startX.current = null;
  };

  // ── Mouse — listeners on window so fast drags outside the element still work ──
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      startX.current = e.clientX;
      dragging.current = false;

      const handleMove = (ev: MouseEvent) => {
        if (startX.current !== null && Math.abs(ev.clientX - startX.current) > 5) {
          dragging.current = true;
        }
      };

      const handleUp = (ev: MouseEvent) => {
        if (startX.current !== null) {
          const delta = ev.clientX - startX.current;
          if (dragging.current && Math.abs(delta) >= threshold) {
            delta < 0 ? onSwipeLeft() : onSwipeRight();
          }
        }
        startX.current = null;
        dragging.current = false;
        window.removeEventListener("mousemove", handleMove);
        window.removeEventListener("mouseup", handleUp);
      };

      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
    },
    [onSwipeLeft, onSwipeRight, threshold]
  );

  return { onTouchStart, onTouchEnd, onMouseDown };
}

