import { useEffect, useState, type RefObject } from "react";

/**
 * Returns true when the element is within ~2 viewport heights of the visible area.
 * Starts true so editors mount with correct layout heights on first render.
 * IntersectionObserver then unmounts far-away editors after the initial frame.
 */
export function useNearViewport(ref: RefObject<HTMLElement | null>): boolean {
  const [near, setNear] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setNear(entry.isIntersecting);
      },
      { rootMargin: "200% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return near;
}
