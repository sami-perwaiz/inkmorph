"use client";

import { usePathname } from "next/navigation";
import { useCallback } from "react";

import { prepareLegalNavigation } from "@/lib/legalScroll";

/** Saves the current page snapshot before opening a legal route. */
export function useLegalNavigation() {
  const pathname = usePathname();

  return useCallback(() => {
    prepareLegalNavigation(pathname);
  }, [pathname]);
}
