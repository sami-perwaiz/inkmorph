"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { getVisibleIconPacks } from "@/lib/iconPacks";

/** Warm pack detail routes while browsing the packs gallery. */
export function PrefetchPackDetailRoutes() {
  const router = useRouter();

  useEffect(() => {
    for (const pack of getVisibleIconPacks()) {
      router.prefetch(`/packs/${pack.id}`);
    }
  }, [router]);

  return null;
}
