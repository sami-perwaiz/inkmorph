import type { ReactNode } from "react";

import { MENU, getMenuSubItemClassName } from "@/lib/navTokens";

/** Mobile/tablet accordion block — one divider per section, no double lines when open. */
export function MobileNavAccordionSection({
  expanded,
  emphasized = false,
  children,
}: {
  expanded: boolean;
  emphasized?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className="motion-mobile-accordion-section flex w-full flex-col items-stretch"
      data-expanded={expanded ? "true" : "false"}
      data-emphasized={emphasized ? "true" : "false"}
    >
      {children}
    </div>
  );
}

/** Smooth height accordion — avoids mount/unmount layout jumps. */
export function MobileNavAccordionPanel({
  expanded,
  children,
}: {
  expanded: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={["grid", MENU.accordionTransition].join(" ")}
      style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
      aria-hidden={!expanded}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className="motion-accordion-dropdown-inner flex flex-col gap-1 pt-1"
          data-open={expanded ? "true" : "false"}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export type MobileAccordionId = "categories" | "packs" | "account";

export const MOBILE_ACCORDION_TRIGGER_CLASS = "motion-mobile-accordion-trigger";

export function getMobileSubNavLinkClassName(active: boolean): string {
  return getMenuSubItemClassName({ active });
}
