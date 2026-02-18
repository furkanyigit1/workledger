import { useState, useEffect } from "react";

/**
 * Progressively renders items in batches when totalCount jumps significantly.
 * Returns the number of items to render. When totalCount is stable or decreases,
 * renders all immediately (no delay for normal typing/filtering down).
 */
export function useProgressiveRender(totalCount: number, batchSize = 8): number {
  // State tracks: [currentRenderedCount, previousTotalCount]
  const [state, setState] = useState({ rendered: totalCount, prevTotal: totalCount });

  // Detect changes to totalCount and decide rendering strategy
  // This runs during render (not in an effect) to keep prevTotal in sync
  let rendered = state.rendered;
  if (totalCount !== state.prevTotal) {
    const jump = totalCount - state.prevTotal;
    if (totalCount <= state.prevTotal || jump <= batchSize) {
      // Small change or decrease — render all immediately
      rendered = totalCount;
    } else {
      // Large jump — start from where we were
      rendered = state.prevTotal;
    }
    // Note: This setState during render is the React-sanctioned pattern
    // for "adjusting state based on props" (replaces getDerivedStateFromProps)
    setState({ rendered, prevTotal: totalCount });
  }

  // Progressive animation: when rendered < totalCount, increment via rAF
  useEffect(() => {
    if (state.rendered >= totalCount) return;

    let rafId = 0;
    function step() {
      setState((prev) => {
        const next = Math.min(prev.rendered + batchSize, totalCount);
        return { ...prev, rendered: next };
      });
      rafId = requestAnimationFrame(() => {
        // The setState above will trigger a re-render; if still < totalCount,
        // this effect re-runs and schedules another frame
      });
    }
    rafId = requestAnimationFrame(step);

    return () => { if (rafId) cancelAnimationFrame(rafId); };
  }, [state.rendered, totalCount, batchSize]);

  return Math.min(rendered, totalCount);
}
