"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";

import {
  consumeLegalNavigationDirection,
  isLegalPagePath,
  isScrollPersistenceLocked,
  lockScrollPersistence,
  markLegalBackNavigation,
  resetLegalPageScroll,
  restorePageScroll,
  savePageState,
  unlockScrollPersistence,
} from "@/lib/legalScroll";

/** Restores scroll on back; legal pages always open at the top on forward navigation. */
export function ScrollRestoration() {
  const pathname = usePathname();
  const hasMountedRef = useRef(false);
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    if (typeof window.history.scrollRestoration !== "undefined") {
      window.history.scrollRestoration = "manual";
    }

    const handlePopState = () => {
      lockScrollPersistence();
      savePageState(pathnameRef.current, { scrollY: window.scrollY });
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
      if (isScrollPersistenceLocked()) {
        return;
      }

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

      if (!isScrollPersistenceLocked()) {
        persistScroll();
      }
    };
  }, [pathname]);

  useLayoutEffect(() => {
    const previousPath = pathnameRef.current;
    const direction = consumeLegalNavigationDirection();
    const isBackNavigation = direction === "back";
    const isForwardLegalNavigation =
      !isBackNavigation && isLegalPagePath(pathname);

    lockScrollPersistence();

    if (!isBackNavigation && previousPath !== pathname) {
      savePageState(previousPath, { scrollY: window.scrollY });
    }

    pathnameRef.current = pathname;

    if (isForwardLegalNavigation) {
      resetLegalPageScroll(pathname);
    } else if (isBackNavigation) {
      restorePageScroll(pathname);
    }

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
    }

    window.requestAnimationFrame(() => {
      if (isForwardLegalNavigation) {
        resetLegalPageScroll(pathname);
      } else if (isBackNavigation) {
        restorePageScroll(pathname);
      }

      unlockScrollPersistence();
    });
  }, [pathname]);

  return null;
}
