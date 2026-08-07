"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, type MouseEvent } from "react";

interface GoPremiumButtonProps {
  className?: string;
}

const PRICING_PLANS_HREF = "/pricing#pricing-plans";

function scrollToPricingPlans() {
  const el = document.getElementById("pricing-plans");
  if (!el) {
    return;
  }

  const header = document.querySelector("header");
  const headerOffset =
    header instanceof HTMLElement ? header.getBoundingClientRect().height : 0;
  const top =
    el.getBoundingClientRect().top + window.scrollY - headerOffset - 8;

  const behavior: ScrollBehavior =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";

  document.documentElement.scrollTo({ top: Math.max(0, top), behavior });
}

/** Figma Go Premium control — black glass button with crown. */
export function GoPremiumButton({ className = "" }: GoPremiumButtonProps) {
  const pathname = usePathname();

  const handleClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (pathname !== "/pricing") {
        return;
      }

      event.preventDefault();
      window.history.replaceState(null, "", PRICING_PLANS_HREF);
      scrollToPricingPlans();
    },
    [pathname]
  );

  return (
    <Link
      href={PRICING_PLANS_HREF}
      onClick={handleClick}
      className={[
        "relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-[6px] border border-solid border-[#E4E4E4] px-[18px] py-[14px]",
        "font-poppins text-sm font-normal leading-4 tracking-[-0.14px] text-white",
        "shadow-[1px_1px_3px_rgba(78,78,80,0.24)] transition-opacity hover:opacity-90",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2",
        className,
      ].join(" ")}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[6px]"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(255,255,255,0.4) 4.17%, rgba(99,99,99,0.4) 43.06%), linear-gradient(90deg, #000 0%, #000 100%)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_2px_2px_10px_0px_rgba(255,255,255,0.18)]"
      />
      <span className="relative">Go Premium</span>
      <span className="relative size-[14px] shrink-0 overflow-hidden">
        <Image
          src="/icons/crown.png"
          alt=""
          width={20}
          height={20}
          className="absolute left-[-22%] top-[-22%] size-[144%] max-w-none"
          aria-hidden
        />
      </span>
    </Link>
  );
}
