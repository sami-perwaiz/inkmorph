"use client";

import Link from "next/link";
import { memo } from "react";

import { ContentContainer } from "@/components/ContentContainer/ContentContainer";
import { InkMorphLogo } from "@/components/InkMorphLogo/InkMorphLogo";
import { FOOTER, FOOTER_FILTERS } from "@/lib/constants";
import { useLegalNavigation } from "@/hooks/useLegalNavigation";
import { getCategoryHref } from "@/lib/seo/routes";
import type { FilterValue } from "@/types/illustration";

const LEGAL_LINKS = [
  { href: "/license", label: "License" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

const LEGAL_LINK_CLASS =
  "footer-legal-link font-poppins text-base font-normal leading-6 text-gray-500 no-underline decoration-transparent underline-offset-0 transition-colors hover:text-gray-900 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2";

interface FooterProps {
  onFilterChange: (filter: FilterValue) => void;
}

export const Footer = memo(function Footer({ onFilterChange }: FooterProps) {
  const handleLegalLinkClick = useLegalNavigation();

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
              <Link
                key={value}
                href={getCategoryHref(value)}
                onClick={() => onFilterChange(value)}
                className="whitespace-nowrap rounded-sm bg-white px-[15px] py-2 font-inter text-base font-normal leading-6 text-gray-600 opacity-50 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2"
              >
                {label}
              </Link>
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
          <nav
            className="flex shrink-0 flex-col items-center gap-3 tablet:flex-row tablet:flex-wrap tablet:items-center tablet:justify-end tablet:gap-x-8 tablet:gap-y-2"
            aria-label="Legal"
          >
            {LEGAL_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                scroll={false}
                onClick={handleLegalLinkClick}
                className={`${LEGAL_LINK_CLASS} whitespace-nowrap`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </ContentContainer>
    </footer>
  );
});
