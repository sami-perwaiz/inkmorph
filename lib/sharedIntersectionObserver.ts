type ViewportCallback = () => void;

const callbackMap = new WeakMap<Element, ViewportCallback>();

let observer: IntersectionObserver | null = null;
let observerRootMargin = "";

function ensureObserver(rootMargin: string): IntersectionObserver {
  if (observer && observerRootMargin === rootMargin) {
    return observer;
  }

  observer?.disconnect();
  observerRootMargin = rootMargin;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue;
        }

        const callback = callbackMap.get(entry.target);
        if (!callback) {
          continue;
        }

        callback();
        callbackMap.delete(entry.target);
        observer?.unobserve(entry.target);
      }
    },
    { rootMargin, threshold: 0.01 }
  );

  return observer;
}

export function observeSharedViewport(
  element: Element,
  rootMargin: string,
  onVisible: ViewportCallback
): () => void {
  const io = ensureObserver(rootMargin);
  callbackMap.set(element, onVisible);
  io.observe(element);

  return () => {
    callbackMap.delete(element);
    io.unobserve(element);
  };
}
