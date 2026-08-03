"use client";

import Image from "next/image";
import { memo, useMemo } from "react";

import { ContentContainer } from "@/components/ContentContainer/ContentContainer";
import { FOOTER, FOOTER_FILTERS } from "@/lib/constants";
import type { FilterValue } from "@/types/illustration";

interface FooterProps {
  activeFilter: FilterValue;
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
          sizes="40px"
          className="object-cover"
          aria-hidden
        />
      </div>
    </div>
  );
}

export const Footer = memo(function Footer({
  activeFilter,
  onFilterChange,
}: FooterProps) {
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
    <footer
      className="flex flex-col items-center bg-white"
      style={{
        paddingTop: FOOTER.pt,
        paddingBottom: FOOTER.pb,
        gap: FOOTER.sectionGap,
      }}
    >
      <ContentContainer className="px-5 tablet:px-8">
        <div className="flex w-full flex-wrap items-start justify-between gap-6">
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
            className="flex flex-wrap items-center"
            style={{ gap: FOOTER.linkGap }}
            aria-label="Footer categories"
          >
            {FOOTER_FILTERS.map(({ value, label }) => {
              const isActive = activeFilter === value;

              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={isActive}
                  onClick={filterClickHandlers[value]}
                  className={[
                    "whitespace-nowrap font-inter text-base font-normal leading-6 transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2 rounded-sm",
                    isActive
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </nav>
        </div>
      </ContentContainer>

      <ContentContainer className="flex w-full flex-col gap-8 px-5 tablet:px-8">
        <div className="h-px w-full bg-gray-200" aria-hidden />
        <p className="min-h-6 w-full text-center font-inter text-base font-normal leading-6 text-gray-500">
          {FOOTER.copyright}
        </p>
      </ContentContainer>
    </footer>
  );
});
