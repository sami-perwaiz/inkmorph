"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { Footer } from "@/components/Footer/Footer";
import { Navbar } from "@/components/Navbar/Navbar";
import { PremiumBanner } from "@/components/PremiumBanner/PremiumBanner";
import { WallpapersGrid } from "@/components/Packs/WallpapersGrid";
import type { FilterValue } from "@/types/illustration";

/** Figma 40004961:8876 — iPhone Wallpapers tab. */
export function WallpapersView() {
  const router = useRouter();

  const handleFilterChange = useCallback(
    (filter: FilterValue) => {
      router.push(filter === "all" ? "/" : `/?filter=${filter}`);
    },
    [router]
  );

  return (
    <div className="min-h-screen w-full bg-white">
      <Navbar
        activeFilter={null}
        onFilterChange={handleFilterChange}
        packsActive
      />

      <main className="flex w-full flex-col pt-[100px] tablet:pt-[120px] desktop:pt-[138px]">
        <WallpapersGrid />
        <PremiumBanner />
      </main>

      <Footer onFilterChange={handleFilterChange} />
    </div>
  );
}
