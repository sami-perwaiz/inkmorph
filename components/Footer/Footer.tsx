"use client";

import Image from "next/image";

import { ContentContainer } from "@/components/ContentContainer/ContentContainer";
import { FOOTER, FOOTER_FILTERS } from "@/lib/constants";
import type { FilterValue } from "@/types/illustration";

interface FooterProps {
  onFilterChange: (filter: FilterValue) => void;
}

function FooterLogo() {
  return (
    <div
      className="relative shrink-0 overflow-hidden"
      style={{
        width: FOOTER.logoSize,
        height: FOOTER.logoSize,
        borderRadius: FOOTER.logoRadius,
      }}
    >
      <div
        className="absolute inset-0 bg-white/20"
        style={{ borderRadius: FOOTER.logoRadius }}
        aria-hidden
      />
      <div
        className="absolute inset-0 overflow-hidden backdrop-blur-[5px] [-webkit-backdrop-filter:blur(5px)]"
        style={{ borderRadius: FOOTER.logoRadius }}
      >
        <Image
          src="/logo.png"
          alt=""
          fill
          className="object-cover"
          aria-hidden
        />
      </div>
    </div>
  );
}

export function Footer({ onFilterChange }: FooterProps) {
  return (
    <footer
      className="flex flex-col items-center bg-white"
      style={{
        paddingTop: FOOTER.pt,
        paddingBottom: FOOTER.pb,
        gap: FOOTER.sectionGap,
      }}
    >
      <ContentContainer className="px-5 tablet:px-8">
        <div className="flex w-full items-start justify-between">
          <div
            className="flex items-center"
            style={{ gap: FOOTER.logoBrandGap }}
          >
            <FooterLogo />
            <span className="whitespace-nowrap font-poppins text-lg font-medium leading-6 text-gray-900">
              {FOOTER.brandName}
            </span>
          </div>

          <nav
            className="flex items-center"
            style={{ gap: FOOTER.linkGap }}
            aria-label="Footer navigation"
          >
            {FOOTER_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => onFilterChange(value)}
                className="whitespace-nowrap font-inter text-base font-normal leading-6 text-gray-600"
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </ContentContainer>

      <ContentContainer className="flex w-full flex-col gap-8 px-5 tablet:px-8">
        <div className="h-px w-full bg-gray-200" />
        <p className="h-6 w-full text-center font-inter text-base font-normal leading-6 text-gray-500">
          {FOOTER.copyright}
        </p>
      </ContentContainer>
    </footer>
  );
}
