"use client";

import Image from "next/image";

/** Figma 40004708:10043 — pricing hero with 3D assets */
export function PricingHero() {
  return (
    <section
      className="relative w-full overflow-hidden"
      aria-labelledby="pricing-hero-heading"
    >
      <div className="relative mx-auto flex min-h-[420px] w-full max-w-[1440px] items-center justify-center px-4 py-16 tablet:min-h-[560px] tablet:px-[50px] tablet:py-20 wide:min-h-[741px] wide:py-0">
        <div className="motion-pricing-hero-bg absolute inset-0 overflow-hidden">
          <Image
            src="/pricing/hero-bg-v3.png"
            alt=""
            fill
            priority
            quality={100}
            unoptimized
            sizes="100vw"
            className="object-cover object-center"
            aria-hidden
          />
        </div>

        <div className="motion-pricing-hero-copy relative z-10 flex w-full max-w-[453px] flex-col items-center gap-[18px] text-center">
          <h1
            id="pricing-hero-heading"
            className="w-full font-poppins text-[28px] font-medium leading-[34px] text-black tablet:text-[32px] tablet:leading-[38px]"
          >
            Unlock the Complete InkMorph Library
          </h1>
          <p className="motion-pricing-hero-body w-full font-poppins text-base font-normal leading-6 text-[#797979]">
            Choose the plan that fits your creative workflow. Start free with
            daily credits or unlock the full library with a one-time purchase
            for unlimited downloads, transparent PNG exports, high-resolution
            assets, and lifetime updates.
          </p>
        </div>
      </div>
    </section>
  );
}
