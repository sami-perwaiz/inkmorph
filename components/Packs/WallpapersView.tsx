"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { ContentContainer } from "@/components/ContentContainer/ContentContainer";
import { Footer } from "@/components/Footer/Footer";
import { Navbar } from "@/components/Navbar/Navbar";
import type { FilterValue } from "@/types/illustration";

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

      <main className="flex w-full flex-col pt-[100px] tablet:pt-[120px] laptop:pt-[138px]">
        <ContentContainer>
          <div className="flex min-h-[320px] flex-col items-center justify-center px-4 py-24 text-center tablet:px-[50px]">
            <h1 className="font-poppins text-[32px] font-medium leading-[38px] text-black">
              iPhone Wallpapers
            </h1>
            <p className="mt-3 max-w-md font-poppins text-base font-normal leading-6 text-[#797979]">
              Premium iPhone wallpapers are coming soon.
            </p>
          </div>
        </ContentContainer>
      </main>

      <Footer onFilterChange={handleFilterChange} />
    </div>
  );
}
