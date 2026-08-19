"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { BackButton } from "@/components/BackButton/BackButton";
import { InkMorphLogo } from "@/components/InkMorphLogo/InkMorphLogo";
import { CHECKOUT } from "@/lib/checkoutTokens";

interface CheckoutPageShellProps {
  children: ReactNode;
}

/** Shared checkout chrome — Figma back top-left, logo top-right. */
export function CheckoutPageShell({ children }: CheckoutPageShellProps) {
  return (
    <main className="relative flex min-h-screen flex-col bg-white">
      <div
        className="relative z-20 flex shrink-0 items-center justify-between"
        style={{
          paddingLeft: CHECKOUT.headerInset,
          paddingRight: CHECKOUT.headerInset,
          paddingTop: CHECKOUT.headerInset,
          paddingBottom: CHECKOUT.headerInset,
        }}
      >
        <BackButton
          ariaLabel="Back"
          useHistoryBack
          fallbackHref="/pricing"
        />
        <Link
          href="/"
          aria-label="InkMorph home"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2"
        >
          <InkMorphLogo
            size={CHECKOUT.logoSize}
            radius={CHECKOUT.logoRadius}
            alt=""
          />
        </Link>
      </div>

      <div className="flex flex-1 flex-col items-center px-4 pb-16 pt-2 tablet:px-8 desktop:px-[50px]">
        {children}
      </div>
    </main>
  );
}
