"use client";

import Link from "next/link";
import { memo, useMemo } from "react";

import { ContentContainer } from "@/components/ContentContainer/ContentContainer";
import { InkMorphLogo } from "@/components/InkMorphLogo/InkMorphLogo";
import { FOOTER, FOOTER_FILTERS } from "@/lib/constants";
import type { FilterValue } from "@/types/illustration";

interface FooterProps {
  onFilterChange: (filter: FilterValue) => void;
}

export const Footer = memo(function Footer({ onFilterChange }: FooterProps) {
  const filterClickHandlers = useMemo(() => {
    const handlers = {} as Record<
      (typeof FOOTER_FILTERS)[number]["value"],
      () => void
    >;

    for (const { value } of FOOTER_FILTERS) {
      handlers[value] = () => onFilterChange(value);
    }

    return handlers;
  }, [onFilterChange]);

  return (
    <footer className="flex flex-col items-center gap-16 bg-white px-4 py-12 tablet:gap-16 tablet:px-[50px] tablet:pb-12 tablet:pt-16">
      <ContentContainer>
        <div className="flex w-full flex-col items-center gap-8 tablet:flex-row tablet:items-start tablet:justify-between tablet:gap-6">
          <div
            className="flex items-center"
            style={{ gap: FOOTER.logoBrandGap }}
          >
            <InkMorphLogo
              size={FOOTER.logoSize}
              radius={FOOTER.logoRadius}
              alt=""
            />
            <span className="whitespace-nowrap font-poppins text-lg font-medium leading-6 text-gray-900">
              {FOOTER.brandName}
            </span>
          </div>

          <nav
            className="flex w-full flex-col items-center gap-4 tablet:w-auto tablet:flex-row tablet:flex-wrap tablet:justify-end"
            aria-label="Footer categories"
          >
            {FOOTER_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={filterClickHandlers[value]}
                className="whitespace-nowrap rounded-sm bg-white px-[15px] py-2 font-inter text-base font-normal leading-6 text-gray-600 opacity-50 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2"
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </ContentContainer>

      <ContentContainer className="flex w-full flex-col gap-8">
        <div className="h-px w-full bg-gray-200" aria-hidden />
        <div className="flex w-full flex-col items-center gap-8 tablet:flex-row tablet:items-center tablet:justify-between">
          <p className="min-h-6 w-full text-center font-inter text-base font-normal leading-6 text-gray-500 tablet:flex-1 tablet:text-left">
            {FOOTER.copyright}
          </p>
          <Link
            href="/privacy"
            className="shrink-0 font-poppins text-base font-normal leading-6 text-gray-500 underline decoration-solid underline-offset-[from-font] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2"
          >
            Privacy Policy
          </Link>
        </div>
      </ContentContainer>
    </footer>
  );
});
