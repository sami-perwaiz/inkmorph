"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { CheckoutPageShell } from "@/components/Checkout/CheckoutPageShell";
import { LockIcon } from "@/components/icons/ActionIcons";
import { getAuthEntryHref, isSignedIn } from "@/lib/authSession";
import { isPaidCheckoutPlan } from "@/lib/checkoutForm";
import { CHECKOUT } from "@/lib/checkoutTokens";

interface ProcessingStepProps {
  iconSrc: string;
  title: string;
  description: string;
  active?: boolean;
}

function ProcessingStep({
  iconSrc,
  title,
  description,
  active = false,
}: Omit<ProcessingStepProps, "iconAlt">) {
  return (
    <div className="flex w-full items-center rounded-[10px] border-b border-solid border-[#EAEAEA] bg-white p-2.5">
      <div className="flex min-w-0 flex-1 items-center gap-5">
        <div className="relative size-10 shrink-0">
          {active ? (
            <div className="relative flex size-10 items-center justify-center" aria-hidden>
              <div className="absolute inset-[7.5%] rounded-full bg-[#ECFDF3]" />
              <div className="absolute inset-[12%] animate-spin rounded-full border-2 border-[#D1FADF] border-t-[#039855]" />
            </div>
          ) : (
            <Image
              src={iconSrc}
              alt=""
              width={40}
              height={40}
              className="size-10"
              aria-hidden
            />
          )}
          {active ? <span className="sr-only">In progress</span> : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-poppins text-lg font-medium leading-7 text-black">{title}</p>
          <p className="font-poppins text-base font-normal leading-7 text-[#797979]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export function CheckoutProcessingScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan");

  useEffect(() => {
    if (!isSignedIn()) {
      const returnPath = planId
        ? `/checkout/processing?plan=${encodeURIComponent(planId)}`
        : "/checkout/processing";
      router.replace(getAuthEntryHref(returnPath));
      return;
    }

    if (!isPaidCheckoutPlan(planId)) {
      router.replace("/pricing#pricing-plans");
    }
  }, [planId, router]);

  if (!isPaidCheckoutPlan(planId)) {
    return null;
  }

  return (
    <CheckoutPageShell>
      <div className="flex w-full max-w-[782px] flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-8">
          <div className="relative size-[90px]">
            <Image
              src="/checkout/processing-lock-ring.svg"
              alt=""
              width={90}
              height={90}
              className="size-[90px]"
              aria-hidden
            />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <LockIcon className="size-10 text-[#039855]" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-0.5 text-center">
            <h1 className="font-poppins text-[30px] font-medium leading-[38px] tracking-[-0.3px] text-[#202020]">
              Processing your payment...
            </h1>
            <p className="font-inter text-base font-normal leading-7 text-[#797979]">
              Please don&apos;t close this window or refresh the page.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-8">
          <div className="flex w-full flex-col gap-6">
            <ProcessingStep
              iconSrc="/checkout/step-complete.svg"
              title="Payment details received"
              description="Your payment information has been securely received."
            />
            <ProcessingStep
              iconSrc="/checkout/step-spinner-ring.svg"
              title="Verifying payment"
              description="We're verifying your payment with the bank."
              active
            />
            <ProcessingStep
              iconSrc="/checkout/step-pending.svg"
              title="Finalizing your order"
              description="Once verified, you'll be redirected automatically."
            />

            <div
              className="flex w-full items-center rounded-[10px] border border-solid px-6 py-3.5"
              style={{
                backgroundColor: CHECKOUT.success25,
                borderColor: CHECKOUT.success100,
              }}
            >
              <div className="flex min-w-0 flex-1 items-center gap-5">
                <Image
                  src="/checkout/step-shield.svg"
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 shrink-0"
                  aria-hidden
                />
                <div className="min-w-0">
                  <p
                    className="font-poppins text-lg font-medium leading-7"
                    style={{ color: CHECKOUT.success900 }}
                  >
                    Secure &amp; Encrypted
                  </p>
                  <p
                    className="font-poppins text-base font-normal leading-7 opacity-50"
                    style={{ color: CHECKOUT.success700 }}
                  >
                    Your payment is protected with 256-bit SSL encryption.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center font-poppins text-lg font-medium leading-7 text-[#797979]">
            Need help? Contact{" "}
            <Link
              href={`mailto:${CHECKOUT.supportEmail}`}
              className="text-[#039855] focus-visible:outline-none focus-visible:underline"
            >
              {CHECKOUT.supportEmail}
            </Link>
          </p>
        </div>
      </div>
    </CheckoutPageShell>
  );
}
