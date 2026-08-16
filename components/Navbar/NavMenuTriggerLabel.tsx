import type { ReactNode } from "react";

import { NavChevron } from "@/components/Navbar/NavChevron";

export function NavMenuTriggerLabel({
  label,
  expanded,
}: {
  label: ReactNode;
  expanded: boolean;
}) {
  return (
    <span className="flex w-full min-w-0 items-center justify-between gap-3">
      <span className="min-w-0 flex-1 break-words text-left">{label}</span>
      <NavChevron expanded={expanded} />
    </span>
  );
}
