"use client";

import Image from "next/image";

import { ContentContainer } from "@/components/ContentContainer/ContentContainer";
import { GoPremiumButton } from "@/components/GoPremiumButton/GoPremiumButton";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { CTA } from "@/lib/constants";

interface PremiumBannerProps {
  /** Keep visible on pages like /pricing where the CTA is part of the layout. */
  alwaysShow?: boolean;
}

/** Premium promo banner — hidden for Pro users who already have full library access. */
export function PremiumBanner({ alwaysShow = false }: PremiumBannerProps) {
  const { hasPremiumAccess, isReady } = usePremiumAccess();

  if (!alwaysShow && isReady && hasPremiumAccess) {
    return null;
  }

  return (
    <ContentContainer className={CTA.sectionGapClass}>
      <section
        className="relative mx-4 overflow-hidden rounded-2xl border border-solid border-[#EAEAEA] tablet:mx-[50px]"
        aria-labelledby="premium-banner-heading"
      >
        <div className="absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden>
          <Image
            src="/home/premium-banner-bg.png"
            alt=""
            fill
            sizes="(max-width: 767px) 358px, (max-width: 1439px) 774px, 1340px"
            className="object-cover object-center"
          />
        </div>

        <div className="relative flex min-h-[363px] flex-col items-center justify-center gap-4 px-6 py-12 tablet:px-8 wide:px-12">
          <div className="flex w-full max-w-[614px] flex-col items-center text-center">
            <h2
              id="premium-banner-heading"
              className="max-w-[258px] font-lora text-[30px] font-normal leading-normal text-black tablet:max-w-none tablet:text-[48px]"
            >
              Unlock the Full 3D Library
            </h2>
            <p className="max-w-[310px] font-poppins text-sm font-normal leading-[23px] tracking-[0.14px] text-[#797979] tablet:max-w-[614px]">
              Get unlimited access to premium 3D assets crafted for designers,
              developers, and creative teams. Download high-quality avatars,
              characters, objects, and abstract elements without limits.
            </p>
          </div>
          <GoPremiumButton />
        </div>
      </section>
    </ContentContainer>
  );
}
