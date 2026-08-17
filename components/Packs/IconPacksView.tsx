"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { Footer } from "@/components/Footer/Footer";
import { IconPacksGrid } from "@/components/Packs/IconPacksGrid";
import { PrefetchPackDetailRoutes } from "@/components/Packs/PrefetchPackDetailRoutes";
import { Navbar } from "@/components/Navbar/Navbar";
import { PremiumBanner } from "@/components/PremiumBanner/PremiumBanner";
import type { FilterValue } from "@/types/illustration";

/** Figma 40004878:12459 — Icon Packs page. */
export function IconPacksView() {
  const router = useRouter();

  const handleFilterChange = useCallback(
    (filter: FilterValue) => {
      router.push(filter === "all" ? "/" : `/?filter=${filter}`);
    },
    [router]
  );

  return (
    <div className="min-h-screen w-full bg-white">
      <PrefetchPackDetailRoutes />
      <Navbar
        activeFilter={null}
        onFilterChange={handleFilterChange}
        packsActive
      />

      <main className="flex w-full flex-col pt-[100px] tablet:pt-[120px] desktop:pt-[138px]">
        <IconPacksGrid />
        <PremiumBanner />
      </main>

      <Footer onFilterChange={handleFilterChange} />
    </div>
  );
}
