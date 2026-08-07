"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

import { Footer } from "@/components/Footer/Footer";
import { Navbar } from "@/components/Navbar/Navbar";
import { PremiumBanner } from "@/components/PremiumBanner/PremiumBanner";
import { PricingHero } from "@/components/Pricing/PricingHero";
import { PricingPlans } from "@/components/Pricing/PricingPlans";
import type { FilterValue } from "@/types/illustration";

const PRICING_PLANS_HASH = "#pricing-plans";
const PRICING_REVEAL_KEY = "inkmorph-pricing-reveal";

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

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

  const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";

  document.documentElement.scrollTo({ top: Math.max(0, top), behavior });
}

export function PricingView() {
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);

  const handleFilterChange = useCallback(
    (filter: FilterValue) => {
      router.push(filter === "all" ? "/" : `/?filter=${filter}`);
    },
    [router]
  );

  useLayoutEffect(() => {
    const page = pageRef.current;
    if (!page) {
      return;
    }

    if (prefersReducedMotion() || sessionStorage.getItem(PRICING_REVEAL_KEY)) {
      page.dataset.visible = "true";
      return;
    }

    sessionStorage.setItem(PRICING_REVEAL_KEY, "1");
    page.dataset.animate = "true";

    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        page.dataset.visible = "true";
      });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (window.location.hash !== PRICING_PLANS_HASH) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(scrollToPricingPlans);
    });
    const timeout = window.setTimeout(scrollToPricingPlans, 100);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <div ref={pageRef} className="motion-pricing-page min-h-screen w-full bg-white">
      <Navbar
        activeFilter={null}
        onFilterChange={handleFilterChange}
        pricingActive
      />

      <main className="flex w-full flex-col pt-[70px] laptop:pt-[90px]">
        <PricingHero />
        <div className="mt-[120px] flex flex-col">
          <PricingPlans />
          <div className="mt-[120px]">
            <PremiumBanner />
          </div>
        </div>
      </main>

      <Footer onFilterChange={handleFilterChange} />
    </div>
  );
}
