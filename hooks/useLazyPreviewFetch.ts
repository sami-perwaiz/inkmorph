"use client";

import { useAdaptiveRootMargin } from "@/hooks/useAdaptiveRootMargin";
import { useSharedInViewport } from "@/hooks/useSharedInViewport";
import { GALLERY } from "@/lib/constants";
import { hasIllustrationImageLoaded } from "@/lib/illustrationImageCache";

/**
 * Gate preview `<Image>` mounts until near the viewport.
 * Priority and session-cached previews fetch immediately.
 */
export function useLazyPreviewFetch(
  src: string,
  priority = false,
  rootMargin: string = GALLERY.viewportRootMargin
) {
  const cached = hasIllustrationImageLoaded(src);
  const margin = useAdaptiveRootMargin(rootMargin);
  const shouldObserve = !priority && !cached;
  const { ref, inViewport } = useSharedInViewport(margin, shouldObserve);
  const shouldFetch = priority || cached || inViewport;

  return { ref, shouldFetch };
}
