"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { LazyImage } from "@/components/LazyImage/LazyImage";
import { DownloadWallpaperButton } from "@/components/Packs/DownloadWallpaperButton";
import { PackBackButton } from "@/components/Packs/PackBackButton";
import { Footer } from "@/components/Footer/Footer";
import { Navbar } from "@/components/Navbar/Navbar";
import { PremiumBanner } from "@/components/PremiumBanner/PremiumBanner";
import { usePremiumAccessGate } from "@/components/PremiumAccessProvider/PremiumAccessProvider";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { downloadImage } from "@/lib/illustrationActions";
import {
  canAccessWallpaperPack,
  getWallpaperDownloadFilename,
  getWallpaperDownloadSrc,
  type WallpaperPack,
} from "@/lib/wallpaperPacks";
import type { FilterValue } from "@/types/illustration";

interface WallpaperDetailViewProps {
  pack: WallpaperPack;
}

/** Figma 40004981:9735 — back + centered preview/info column. */
export function WallpaperDetailView({ pack }: WallpaperDetailViewProps) {
  const router = useRouter();
  const { hasPremiumAccess } = usePremiumAccess();
  const { requestPremiumAccess } = usePremiumAccessGate();

  const handleFilterChange = useCallback(
    (filter: FilterValue) => {
      router.push(filter === "all" ? "/" : `/?filter=${filter}`);
    },
    [router]
  );

  const handleDownload = useCallback(async () => {
    if (!canAccessWallpaperPack(pack, hasPremiumAccess)) {
      requestPremiumAccess();
      return;
    }

    const src = getWallpaperDownloadSrc(pack);
    await downloadImage(src, getWallpaperDownloadFilename(pack), "1x");
  }, [hasPremiumAccess, pack, requestPremiumAccess]);

  return (
    <div className="min-h-screen w-full bg-white">
      <Navbar
        activeFilter={null}
        onFilterChange={handleFilterChange}
        packsActive
      />

      <main className="flex w-full flex-col pt-[100px] tablet:pt-[120px] desktop:pt-[138px]">
        <section className="w-full px-4 tablet:px-[50px]">
          <div className="mx-auto flex w-full max-w-[1340px] flex-col items-start gap-5">
            <PackBackButton
              href="/wallpapers"
              ariaLabel="Back to iPhone wallpapers"
            />

            <div className="flex w-full min-w-0 flex-col items-center gap-10 desktop:h-[600px] desktop:flex-row desktop:items-start desktop:justify-center desktop:gap-[100px]">
              <div className="relative mx-auto aspect-[277/600] w-full max-w-[277px] shrink-0 overflow-hidden rounded-[20px] bg-[#FAFAFA] desktop:mx-0 desktop:h-[600px] desktop:w-[277px] desktop:aspect-auto">
                <LazyImage
                  src={pack.previewSrc}
                  alt={pack.title}
                  sizes="(max-width: 1199px) min(277px, 100vw), 277px"
                  priority
                  quality={85}
                  className="object-cover object-center"
                />
              </div>

              <div className="flex w-full max-w-[277px] flex-col items-center gap-4 desktop:w-fit desktop:max-w-none desktop:items-start desktop:pt-0">
                <div className="flex w-full flex-col items-center desktop:w-fit desktop:items-start">
                  <h1 className="w-full text-center font-lora text-[36px] font-normal leading-normal text-black tablet:text-[48px] desktop:w-fit desktop:text-left">
                    {pack.title}
                  </h1>
                  <p className="w-full text-center font-poppins text-[14px] font-normal leading-[23px] tracking-[0.14px] text-[#797979] desktop:w-fit desktop:text-left">
                    by {pack.author}
                  </p>
                </div>

                <DownloadWallpaperButton
                  onClick={handleDownload}
                  className="self-center desktop:self-auto"
                />
              </div>
            </div>
          </div>
        </section>

        <PremiumBanner />
      </main>

      <Footer onFilterChange={handleFilterChange} />
    </div>
  );
}
