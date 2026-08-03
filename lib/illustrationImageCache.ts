/**
 * Session-level cache of illustration srcs that have fully loaded at least once.
 * Survives GalleryCard remounts when switching filter tabs.
 */
const loadedIllustrationSrcs = new Set<string>();

export function hasIllustrationImageLoaded(src: string): boolean {
  return loadedIllustrationSrcs.has(src);
}

export function markIllustrationImageLoaded(src: string): void {
  loadedIllustrationSrcs.add(src);
}
