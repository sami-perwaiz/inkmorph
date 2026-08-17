"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";

import { getAuthEntryHref } from "@/lib/authSession";
import { PRICING_PLANS, type PricingPlan } from "@/lib/pricingPlans";
import { runPurchaseAction } from "@/lib/testingPremiumAccess";

/** Figma check instance — 20×20 with stroke mark. */
function CheckIcon() {
  return (
    <span className="relative size-5 shrink-0 overflow-hidden" aria-hidden>
      <svg
        viewBox="0 0 14.25 10.0833"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-[20.83%] top-[29.17%] h-[41.66%] w-[62.5%]"
      >
        <path
          d="M0.875 5.04167L5.04167 9.20833L13.375 0.875"
          stroke="black"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function PlanCta({
  plan,
  onPurchaseClick,
}: {
  plan: PricingPlan;
  onPurchaseClick: () => void;
}) {
  if (plan.ctaVariant === "primary") {
    return (
      <button
        type="button"
        onClick={onPurchaseClick}
        className={[
          "relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-[6px] px-[18px] py-2.5",
          "font-poppins text-sm font-medium leading-5 text-white",
          "shadow-[1px_1px_3px_rgba(78,78,80,0.24)] transition-opacity hover:opacity-90",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2",
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
        <span className="relative">{plan.ctaLabel}</span>
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
      </button>
    );
  }

  return (
    <Link
      href={getAuthEntryHref()}
      className={[
        "flex w-full items-center justify-center rounded-[6px] bg-[#F5F5F5] px-[18px] py-2.5",
        "font-poppins text-sm font-medium leading-5 text-black transition-opacity hover:opacity-80",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2",
      ].join(" ")}
    >
      {plan.ctaLabel}
    </Link>
  );
}

function PricingCard({
  plan,
  onPurchaseClick,
}: {
  plan: PricingPlan;
  onPurchaseClick: () => void;
}) {
  return (
    <article className="motion-pricing-plan-card flex min-w-0 flex-1 flex-col gap-8 self-stretch rounded-[14px] border border-solid border-[#E5E5E5] bg-white p-6">
      <div className="flex w-full flex-col gap-6">
        <div className="flex w-full flex-col gap-3">
          <h3 className="w-full font-poppins text-lg font-semibold leading-7 text-[#0A0A0A]">
            {plan.name}
          </h3>
          <p className="w-full font-poppins text-sm font-normal leading-5 text-[#737373]">
            {plan.description}
          </p>
        </div>

        <div className="flex w-full items-end gap-0.5">
          <p className="whitespace-nowrap font-poppins text-4xl font-semibold leading-10 text-black">
            {plan.price}
          </p>
          {plan.priceSuffix ? (
            <p className="whitespace-nowrap font-poppins text-base font-normal leading-6 text-[#737373]">
              {plan.priceSuffix}
            </p>
          ) : null}
        </div>

        <PlanCta plan={plan} onPurchaseClick={onPurchaseClick} />
      </div>

      <div className="flex w-full flex-col gap-4">
        <p className="whitespace-nowrap font-poppins text-sm font-medium leading-5 text-black">
          {plan.includesLabel}
        </p>
        <ul className="flex w-full flex-col gap-4">
          {plan.features.map((feature) => (
            <li key={feature} className="flex w-full items-center gap-3">
              <CheckIcon />
              <span className="min-w-0 flex-1 font-poppins text-sm font-normal leading-5 text-[#737373]">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

/** Figma 40004706:9735 — plan cards */
export function PricingPlans() {
  const handlePurchaseClick = useCallback(() => {
    runPurchaseAction();
  }, []);

  return (
    <section
      id="pricing-plans"
      className="relative mx-auto flex w-full max-w-[1260px] flex-col items-center gap-[50px] desktop:px-[50px]"
      aria-labelledby="pricing-plans-heading"
    >
      <div className="motion-pricing-plans-copy flex w-full max-w-[660px] flex-col items-center gap-[18px] px-4 text-center tablet:px-0">
        <h2
          id="pricing-plans-heading"
          className="w-full font-poppins text-[32px] font-medium leading-[38px] text-black"
        >
          Choose the Plan That Fits You
        </h2>
        <p className="w-full font-poppins text-base font-normal leading-6 text-[#797979]">
          Start free with daily credits or unlock unlimited access to every
          illustration, high-resolution downloads, and transparent PNG exports
          with InkMorph.
        </p>
      </div>

      <div className="flex w-full max-w-[1160px] flex-col items-stretch gap-6 px-4 tablet:px-[50px] desktop:flex-row desktop:items-stretch desktop:gap-6 desktop:px-0">
        {PRICING_PLANS.map((plan) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            onPurchaseClick={handlePurchaseClick}
          />
        ))}
      </div>
    </section>
  );
}
