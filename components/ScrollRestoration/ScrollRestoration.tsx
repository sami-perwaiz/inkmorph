"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

import {
  consumeLegalNavigationDirection,
  isLegalPagePath,
  markLegalBackNavigation,
  restorePageScroll,
  savePageState,
} from "@/lib/legalScroll";

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Restores scroll when navigating back; scrolls legal pages to top on forward nav. */
export function ScrollRestoration() {
  const pathname = usePathname();
  const hasMountedRef = useRef(false);
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    if (typeof window.history.scrollRestoration !== "undefined") {
      window.history.scrollRestoration = "manual";
    }

    const handlePopState = () => {
      markLegalBackNavigation();
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    let timeout: number | null = null;

    const persistScroll = () => {
      savePageState(pathnameRef.current);
    };

    const onScroll = () => {
      if (timeout !== null) {
        window.clearTimeout(timeout);
      }

      timeout = window.setTimeout(persistScroll, 100);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);

      if (timeout !== null) {
        window.clearTimeout(timeout);
      }

      persistScroll();
    };
  }, [pathname]);

  useLayoutEffect(() => {
    const previousPath = pathnameRef.current;
    pathnameRef.current = pathname;

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const direction = consumeLegalNavigationDirection();
    const isBackNavigation = direction === "back";

    if (!isBackNavigation) {
      savePageState(previousPath);
    }

    if (isBackNavigation) {
      restorePageScroll(pathname);
      return;
    }

    if (isLegalPagePath(pathname)) {
      const behavior: ScrollBehavior = prefersReducedMotion()
        ? "auto"
        : "smooth";
      window.scrollTo({ top: 0, behavior });
    }
  }, [pathname]);

  return null;
}
