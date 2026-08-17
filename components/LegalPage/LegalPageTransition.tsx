"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";

interface LegalPageTransitionProps {
  children: ReactNode;
}

/** Legal routes render without enter/exit animation to avoid scroll interference. */
export function LegalPageTransition({ children }: LegalPageTransitionProps) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="legal-page-transition" data-visible="true">
      {children}
    </div>
  );
}
