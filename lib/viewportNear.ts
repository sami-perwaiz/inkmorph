/** Parse IntersectionObserver rootMargin shorthand into pixel insets. */
function parseRootMarginPx(rootMargin: string): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  const parts = rootMargin
    .trim()
    .split(/\s+/)
    .map((part) => Number.parseFloat(part) || 0);

  if (parts.length === 1) {
    return {
      top: parts[0],
      right: parts[0],
      bottom: parts[0],
      left: parts[0],
    };
  }

  if (parts.length === 2) {
    return {
      top: parts[0],
      right: parts[1],
      bottom: parts[0],
      left: parts[1],
    };
  }

  if (parts.length === 3) {
    return {
      top: parts[0],
      right: parts[1],
      bottom: parts[2],
      left: parts[1],
    };
  }

  return {
    top: parts[0] ?? 0,
    right: parts[1] ?? 0,
    bottom: parts[2] ?? 0,
    left: parts[3] ?? 0,
  };
}

/** True when element overlaps the viewport expanded by rootMargin (IO-compatible). */
export function isNearViewport(element: Element, rootMargin: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const rect = element.getBoundingClientRect();
  const { top, right, bottom, left } = parseRootMarginPx(rootMargin);
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  return (
    rect.bottom >= -top &&
    rect.top <= viewportHeight + bottom &&
    rect.right >= -left &&
    rect.left <= viewportWidth + right
  );
}
