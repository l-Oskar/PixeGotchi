import { useEffect, useRef } from "react";

export function useGameLoop(active: boolean, update: () => void) {
  const frameRef = useRef<number>();
  const updateRef = useRef(update);
  updateRef.current = update;

  useEffect(() => {
    if (!active) return;

    let lastTime = performance.now();
    function loop(now: number) {
      const delta = Math.min(100, now - lastTime);
      if (delta >= 16) {
        // ~60 fps
        updateRef.current();
        lastTime = now;
      }
      frameRef.current = requestAnimationFrame(loop);
    }

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [active]);
}
