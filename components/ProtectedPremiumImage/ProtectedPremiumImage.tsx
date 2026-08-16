"use client";

import type { DragEvent, MouseEvent, ReactNode } from "react";

/**
 * Casual copy protection for individual premium gallery assets only.
 * No visual overlay — image stays 100% visible and unchanged.
 */
export function ProtectedPremiumImage({
  enabled = false,
  className = "",
  children,
}: {
  enabled?: boolean;
  className?: string;
  children: ReactNode;
}) {
  if (!enabled) {
    return <>{children}</>;
  }

  const blockContextMenu = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
  };

  const blockDrag = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
  };

  return (
    <div
      className={["premium-gallery-asset-protected", className]
        .filter(Boolean)
        .join(" ")}
      onContextMenu={blockContextMenu}
      onDragStart={blockDrag}
    >
      {children}
    </div>
  );
}
