"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { CheckoutPageShell } from "@/components/Checkout/CheckoutPageShell";
import { getAuthEntryHref, isSignedIn } from "@/lib/authSession";
import { isPaidCheckoutPlan } from "@/lib/checkoutForm";
import { CHECKOUT } from "@/lib/checkoutTokens";
import { getMockPurchase, type MockPurchaseRecord } from "@/lib/mockCheckout";

function OrderRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="font-inter text-sm font-medium leading-[22px] text-[#797979]">
        {label}
      </span>
      <span className="text-right font-inter text-sm font-medium leading-[22px] text-[#202020]">
        {value}
      </span>
    </div>
  );
}

export function CheckoutSuccessScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan");
  const [purchase, setPurchase] = useState<MockPurchaseRecord | null>(null);

  useEffect(() => {
    if (!isSignedIn()) {
      const returnPath = planId
        ? `/checkout/success?plan=${encodeURIComponent(planId)}`
        : "/checkout/success";
      router.replace(getAuthEntryHref(returnPath));
      return;
    }

    const record = getMockPurchase();
    if (!record) {
      router.replace("/pricing#pricing-plans");
      return;
    }

    if (isPaidCheckoutPlan(planId) && record.planId !== planId) {
      router.replace(`/checkout/success?plan=${encodeURIComponent(record.planId)}`);
      return;
    }

    setPurchase(record);
  }, [planId, router]);

  if (!purchase) {
    return null;
  }

  return (
    <CheckoutPageShell>
      <div className="flex w-full max-w-[520px] flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-6 text-center">
          <div
            className="flex size-[72px] items-center justify-center rounded-full"
            style={{ backgroundColor: CHECKOUT.success25 }}
          >
            <Image
              src="/checkout/circle-check-green.svg"
              alt=""
              width={40}
              height={40}
              className="size-10"
              aria-hidden
            />
          </div>

          <div className="flex flex-col gap-0.5">
            <h1 className="font-poppins text-[30px] font-medium leading-[38px] tracking-[-0.3px] text-[#202020]">
              Payment Successful!
            </h1>
            <p className="font-inter text-base font-normal leading-7 text-[#797979]">
              Your payment has been successfully processed.
            </p>
          </div>
        </div>

        <div
          className="flex w-full flex-col gap-4 rounded-[10px] border border-solid p-5"
          style={{
            borderColor: CHECKOUT.inputBorder,
            boxShadow: CHECKOUT.inputShadow,
          }}
        >
          <OrderRow label="Plan" value={purchase.planName} />
          <OrderRow label="Amount" value={purchase.amount} />
          <OrderRow label="Status" value={purchase.status} />
        </div>

        <div className="flex w-full flex-col gap-3">
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-lg font-inter text-base font-medium leading-7 text-white transition-colors hover:bg-[#0468cc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#057AF0]/40 focus-visible:ring-offset-2"
            style={{
              height: 44,
              backgroundColor: CHECKOUT.primary,
            }}
          >
            Continue to InkMorph
          </Link>

          <Link
            href="/complete-profile"
            className="inline-flex w-full items-center justify-center rounded-lg border border-solid bg-white px-4 font-inter text-base font-medium leading-7 transition-colors hover:bg-gray-100/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2"
            style={{
              height: 44,
              borderColor: CHECKOUT.inputBorder,
              color: CHECKOUT.labelColor,
            }}
          >
            View My Account
          </Link>
        </div>
      </div>
    </CheckoutPageShell>
  );
}
