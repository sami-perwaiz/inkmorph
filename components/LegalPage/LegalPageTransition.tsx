"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { peekLegalNavigationDirection } from "@/lib/legalScroll";

interface LegalPageTransitionProps {
  children: ReactNode;
}

export function LegalPageTransition({ children }: LegalPageTransitionProps) {
  const pathname = usePathname();
  const hasMountedRef = useRef(false);
  const pathnameRef = useRef(pathname);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const previousPath = pathnameRef.current;
    pathnameRef.current = pathname;

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (previousPath === pathname) {
      return;
    }

    const isBackNavigation = peekLegalNavigationDirection() === "back";

    setVisible(false);

    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setVisible(true);
      });
    });

    if (isBackNavigation) {
      return () => {
        window.cancelAnimationFrame(frame);
      };
    }

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return (
    <div
      className="legal-page-transition"
      data-visible={visible ? "true" : "false"}
    >
      {children}
    </div>
  );
}
