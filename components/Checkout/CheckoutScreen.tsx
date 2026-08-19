"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import { CheckoutPageShell } from "@/components/Checkout/CheckoutPageShell";
import {
  CheckoutField,
  CheckoutInput,
  CheckoutRow,
  CheckoutSectionTitle,
  CheckoutSelect,
} from "@/components/Checkout/CheckoutField";
import { LockIcon } from "@/components/icons/ActionIcons";
import { getAuthEntryHref, getAuthUser, isAuthReady, isSignedIn } from "@/lib/authSession";
import { CHECKOUT_COUNTRIES } from "@/lib/checkoutCountries";
import {
  formatCardNumber,
  formatCvc,
  formatExpiryDate,
  isPaidCheckoutPlan,
  validateCheckoutForm,
  type CheckoutFormErrors,
  type CheckoutFormValues,
} from "@/lib/checkoutForm";
import { CHECKOUT } from "@/lib/checkoutTokens";
import { saveMockCheckoutDraft } from "@/lib/mockCheckout";
import { PRICING_PLANS } from "@/lib/pricingPlans";

const EMPTY_FORM: CheckoutFormValues = {
  fullName: "",
  email: "",
  country: "",
  address: "",
  city: "",
  stateProvince: "",
  postalCode: "",
  cardholderName: "",
  cardNumber: "",
  expiryDate: "",
  cvc: "",
};

function CardPaymentOption() {
  return (
    <div
      className="flex w-full items-center justify-between rounded-[10px] border border-solid p-2.5"
      style={{ borderColor: CHECKOUT.successBorder }}
    >
      <div className="flex items-center gap-2.5">
        <Image
          src="/checkout/credit-card.svg"
          alt=""
          width={40}
          height={40}
          className="size-10 shrink-0"
          aria-hidden
        />
        <div className="flex flex-col gap-0.5">
          <p className="font-poppins text-sm font-semibold leading-[18px] text-[#525252]">
            Card
          </p>
          <p className="font-inter text-xs font-normal leading-[18px] text-[#A3A3A3]">
            Visa, Master, AMEX, and more
          </p>
        </div>
      </div>
      <Image
        src="/checkout/circle-check-green.svg"
        alt=""
        width={24}
        height={24}
        className="size-6 shrink-0"
        aria-hidden
      />
    </div>
  );
}

function CardBrandIcons() {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <Image src="/checkout/visa.svg" alt="Visa" width={37} height={12} className="h-3 w-[37px]" />
      <Image
        src="/checkout/mastercard.svg"
        alt="Mastercard"
        width={23}
        height={14}
        className="h-3.5 w-[23px]"
      />
      <Image src="/checkout/amex.svg" alt="American Express" width={24} height={18} className="h-[18px] w-6" />
    </div>
  );
}

export function CheckoutScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get("plan");
  const formId = useId();

  const [values, setValues] = useState<CheckoutFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<CheckoutFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedPlan = useMemo(
    () => PRICING_PLANS.find((plan) => plan.id === planId) ?? null,
    [planId]
  );

  useEffect(() => {
    if (!isAuthReady()) {
      return;
    }

    if (!isSignedIn()) {
      const returnPath = planId
        ? `/checkout?plan=${encodeURIComponent(planId)}`
        : "/checkout";
      router.replace(getAuthEntryHref(returnPath));
      return;
    }

    if (!isPaidCheckoutPlan(planId)) {
      router.replace("/pricing#pricing-plans");
      return;
    }

    const authUser = getAuthUser();
    setValues((current) => ({
      ...current,
      fullName: current.fullName || authUser?.name || "",
      email: current.email || authUser?.email || "",
    }));
  }, [planId, router]);

  const updateField = useCallback(
    <K extends keyof CheckoutFormValues>(field: K, value: CheckoutFormValues[K]) => {
      setValues((current) => ({ ...current, [field]: value }));
      setErrors((current) => {
        if (!current[field]) {
          return current;
        }

        const next = { ...current };
        delete next[field];
        return next;
      });
    },
    []
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSubmitError(null);

      const nextErrors = validateCheckoutForm(values);
      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        return;
      }

      if (!isPaidCheckoutPlan(planId)) {
        setSubmitError("Select a valid plan before continuing to payment.");
        return;
      }

      saveMockCheckoutDraft(planId, {
        fullName: values.fullName,
        email: values.email,
        country: values.country,
      });

      router.push(`/checkout/processing?plan=${encodeURIComponent(planId)}`);
    },
    [planId, router, values]
  );

  if (!isPaidCheckoutPlan(planId) || !selectedPlan) {
    return null;
  }

  return (
    <CheckoutPageShell>
      <form
        id={formId}
        onSubmit={handleSubmit}
        className="flex w-full max-w-[782px] flex-col gap-8"
        noValidate
      >
        <div className="flex w-full flex-col gap-0.5">
          <h1 className="font-poppins text-[30px] font-medium leading-[38px] tracking-[-0.3px] text-[#202020]">
            Checkout
          </h1>
          <p className="font-inter text-base font-normal leading-7 text-[#A3A3A3]">
            You&apos;re one step away from unlocking your full access.
          </p>
        </div>

        <div className="flex w-full flex-col gap-6">
          <section className="flex w-full flex-col gap-4">
            <CheckoutSectionTitle>Contact Information</CheckoutSectionTitle>
            <CheckoutRow>
              <CheckoutField label="Full Name" htmlFor="checkout-full-name" error={errors.fullName}>
                <CheckoutInput
                  id="checkout-full-name"
                  name="fullName"
                  value={values.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  error={Boolean(errors.fullName)}
                />
              </CheckoutField>
              <CheckoutField label="Email Address" htmlFor="checkout-email" error={errors.email}>
                <CheckoutInput
                  id="checkout-email"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="Enter your email Address"
                  autoComplete="email"
                  error={Boolean(errors.email)}
                />
              </CheckoutField>
            </CheckoutRow>
          </section>

          <section className="flex w-full flex-col gap-4">
            <CheckoutSectionTitle>Billing Information</CheckoutSectionTitle>
            <div className="flex w-full flex-col gap-4">
              <CheckoutField label="Country" htmlFor="checkout-country" error={errors.country}>
                <CheckoutSelect
                  id="checkout-country"
                  name="country"
                  value={values.country}
                  onChange={(event) => updateField("country", event.target.value)}
                  error={Boolean(errors.country)}
                >
                  <option value="">Select your contry</option>
                  {CHECKOUT_COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </CheckoutSelect>
              </CheckoutField>

              <CheckoutRow>
                <CheckoutField label="Address" htmlFor="checkout-address" error={errors.address}>
                  <CheckoutInput
                    id="checkout-address"
                    name="address"
                    value={values.address}
                    onChange={(event) => updateField("address", event.target.value)}
                    placeholder="Enter your address"
                    autoComplete="street-address"
                    error={Boolean(errors.address)}
                  />
                </CheckoutField>
                <CheckoutField label="City" htmlFor="checkout-city" error={errors.city}>
                  <CheckoutInput
                    id="checkout-city"
                    name="city"
                    value={values.city}
                    onChange={(event) => updateField("city", event.target.value)}
                    placeholder="Enter your city"
                    autoComplete="address-level2"
                    error={Boolean(errors.city)}
                  />
                </CheckoutField>
              </CheckoutRow>

              <CheckoutRow>
                <CheckoutField
                  label="State / Province"
                  htmlFor="checkout-state"
                  optional
                  error={errors.stateProvince}
                >
                  <CheckoutInput
                    id="checkout-state"
                    name="stateProvince"
                    value={values.stateProvince}
                    onChange={(event) => updateField("stateProvince", event.target.value)}
                    placeholder="Enter state or province"
                    autoComplete="address-level1"
                    error={Boolean(errors.stateProvince)}
                  />
                </CheckoutField>
                <CheckoutField
                  label="Postal / ZIP Code"
                  htmlFor="checkout-postal"
                  error={errors.postalCode}
                >
                  <CheckoutInput
                    id="checkout-postal"
                    name="postalCode"
                    value={values.postalCode}
                    onChange={(event) => updateField("postalCode", event.target.value)}
                    placeholder="Enter postal / ZIP code"
                    autoComplete="postal-code"
                    error={Boolean(errors.postalCode)}
                  />
                </CheckoutField>
              </CheckoutRow>
            </div>
          </section>

          <section className="flex w-full flex-col gap-4">
            <div className="flex w-full flex-col">
              <CheckoutSectionTitle>Payment Method</CheckoutSectionTitle>
              <p className="font-inter text-base font-normal leading-7 text-[#A3A3A3]">
                All payment are secure and encrypted.
              </p>
            </div>

            <div className="flex w-full flex-col gap-4">
              <CardPaymentOption />

              <CheckoutField
                label="Cardholder Name"
                htmlFor="checkout-cardholder"
                error={errors.cardholderName}
              >
                <CheckoutInput
                  id="checkout-cardholder"
                  name="cardholderName"
                  value={values.cardholderName}
                  onChange={(event) => updateField("cardholderName", event.target.value)}
                  placeholder="Name on card"
                  autoComplete="cc-name"
                  error={Boolean(errors.cardholderName)}
                />
              </CheckoutField>

              <CheckoutField label="Card Number" htmlFor="checkout-card-number" error={errors.cardNumber}>
                <div className="relative w-full">
                  <CheckoutInput
                    id="checkout-card-number"
                    name="cardNumber"
                    inputMode="numeric"
                    value={values.cardNumber}
                    onChange={(event) =>
                      updateField("cardNumber", formatCardNumber(event.target.value))
                    }
                    placeholder="1234 1234 1234 1234"
                    autoComplete="cc-number"
                    error={Boolean(errors.cardNumber)}
                    className="pr-32 tablet:pr-36"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center">
                    <CardBrandIcons />
                  </div>
                </div>
              </CheckoutField>

              <CheckoutRow>
                <CheckoutField label="Expiry Date" htmlFor="checkout-expiry" error={errors.expiryDate}>
                  <CheckoutInput
                    id="checkout-expiry"
                    name="expiryDate"
                    inputMode="numeric"
                    value={values.expiryDate}
                    onChange={(event) =>
                      updateField("expiryDate", formatExpiryDate(event.target.value))
                    }
                    placeholder="MM / YY"
                    autoComplete="cc-exp"
                    error={Boolean(errors.expiryDate)}
                  />
                </CheckoutField>
                <CheckoutField label="CVC" htmlFor="checkout-cvc" error={errors.cvc}>
                  <div className="relative w-full">
                    <CheckoutInput
                      id="checkout-cvc"
                      name="cvc"
                      inputMode="numeric"
                      value={values.cvc}
                      onChange={(event) => updateField("cvc", formatCvc(event.target.value))}
                      placeholder="123"
                      autoComplete="cc-csc"
                      error={Boolean(errors.cvc)}
                      className="pr-10"
                    />
                    <Image
                      src="/checkout/info-circle.svg"
                      alt=""
                      width={20}
                      height={20}
                      className="pointer-events-none absolute right-3.5 top-1/2 size-5 -translate-y-1/2"
                      aria-hidden
                    />
                  </div>
                </CheckoutField>
              </CheckoutRow>
            </div>
          </section>
        </div>

        <div className="flex w-full flex-col items-center gap-3">
          {submitError ? (
            <p
              role="alert"
              className="w-full text-center font-inter text-sm leading-[22px]"
              style={{ color: CHECKOUT.error }}
            >
              {submitError}
            </p>
          ) : null}

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-solid px-4 py-2 font-inter text-base font-medium leading-7 text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#057AF0]/30 focus-visible:ring-offset-2"
            style={{
              backgroundColor: CHECKOUT.primary,
              borderColor: CHECKOUT.primary,
              boxShadow:
                "46px 38px 17px rgba(0,0,0,0), 30px 24px 15px rgba(0,0,0,0), 17px 14px 13px rgba(0,0,0,0.02), 7px 6px 10px rgba(0,0,0,0.03), 2px 2px 5px rgba(0,0,0,0.03)",
            }}
          >
            <LockIcon className="size-5 text-white" />
            Pay Securely
          </button>

          <div className="flex max-w-full flex-col items-center gap-2.5 tablet:flex-row tablet:items-center">
            <LockIcon className="size-5 shrink-0 text-[#A3A3A3]" />
            <p className="max-w-[598px] text-center font-inter text-sm leading-6 text-[#A3A3A3] tablet:text-base tablet:leading-7">
              Your payment information is 100% secure. We never store your card details.
            </p>
          </div>
        </div>
      </form>
    </CheckoutPageShell>
  );
}
