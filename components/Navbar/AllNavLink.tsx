"use client";

import Link from "next/link";

import {
  MobileNavAccordionSection,
  MOBILE_ACCORDION_TRIGGER_CLASS,
} from "@/components/Navbar/MobileNavAccordion";
import { getNavTabClassName, getNavTabStyle } from "@/lib/navTokens";

/** Gallery "All" nav tab — links to the full 3D asset library. */
export function AllNavLink({
  active,
  layout = "inline",
  onNavigate,
}: {
  active: boolean;
  layout?: "inline" | "stacked";
  onNavigate?: () => void;
}) {
  const isStacked = layout === "stacked";

  const link = (
    <Link
      href="/"
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={[
        getNavTabClassName({
          active,
          layout: isStacked ? "stacked" : "inline",
        }),
        isStacked ? MOBILE_ACCORDION_TRIGGER_CLASS : "",
      ].join(" ")}
      style={getNavTabStyle()}
    >
      All
    </Link>
  );

  if (isStacked) {
    return (
      <MobileNavAccordionSection expanded={false} emphasized={active}>
        {link}
      </MobileNavAccordionSection>
    );
  }

  return link;
}
