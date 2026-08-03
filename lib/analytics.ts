"use client";

import { sendGAEvent } from "@next/third-parties/google";

import { isGaEnabled } from "@/lib/analyticsConfig";
import type { FilterValue, IllustrationCategory } from "@/types/illustration";

export type GaEventParams = Record<
  string,
  string | number | boolean | undefined
>;

function isGaReady(): boolean {
  return typeof window !== "undefined" && Array.isArray(window.dataLayer);
}

/**
 * Send a GA4 custom event via the official `@next/third-parties` helper.
 * No-ops outside production and before the GA script is ready (no console noise).
 */
export function trackEvent(
  eventName: string,
  params: GaEventParams = {}
): void {
  if (!isGaEnabled() || !isGaReady()) {
    return;
  }

  const payload: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      payload[key] = value;
    }
  }

  sendGAEvent("event", eventName, payload);
}

export function trackImageDownload(
  imageId: string,
  category: IllustrationCategory
): void {
  trackEvent("image_download", {
    image_id: imageId,
    category,
  });
}

export function trackImageCopy(
  imageId: string,
  category: IllustrationCategory
): void {
  trackEvent("image_copy", {
    image_id: imageId,
    category,
  });
}

export function trackCategoryChange(selectedCategory: FilterValue): void {
  trackEvent("category_change", {
    selected_category: selectedCategory,
  });
}

export function trackDownloadLimitPopup(): void {
  trackEvent("download_limit_popup");
}
