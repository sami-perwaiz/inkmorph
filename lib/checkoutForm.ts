import type { PricingPlan } from "@/lib/pricingPlans";

export interface CheckoutFormValues {
  fullName: string;
  email: string;
  country: string;
  address: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
  cvc: string;
}

export type CheckoutFormField = keyof CheckoutFormValues;

export type CheckoutFormErrors = Partial<Record<CheckoutFormField, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isPaidCheckoutPlan(
  planId: string | null | undefined
): planId is Exclude<PricingPlan["id"], "basic"> {
  return planId === "full-pack" || planId === "lifetime";
}

export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

export function formatExpiryDate(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}

export function formatCvc(value: string): string {
  return value.replace(/\D/g, "").slice(0, 4);
}

export function validateCheckoutForm(
  values: CheckoutFormValues
): CheckoutFormErrors {
  const errors: CheckoutFormErrors = {};

  if (!values.fullName.trim()) {
    errors.fullName = "Full name is required.";
  }

  if (!values.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.country) {
    errors.country = "Select your country.";
  }

  if (!values.address.trim()) {
    errors.address = "Address is required.";
  }

  if (!values.city.trim()) {
    errors.city = "City is required.";
  }

  if (!values.postalCode.trim()) {
    errors.postalCode = "Postal / ZIP code is required.";
  }

  if (!values.cardholderName.trim()) {
    errors.cardholderName = "Cardholder name is required.";
  }

  const cardDigits = values.cardNumber.replace(/\s/g, "");
  if (!cardDigits) {
    errors.cardNumber = "Card number is required.";
  } else if (cardDigits.length < 13 || cardDigits.length > 19) {
    errors.cardNumber = "Enter a valid card number.";
  }

  const expiryDigits = values.expiryDate.replace(/\D/g, "");
  if (!expiryDigits) {
    errors.expiryDate = "Expiry date is required.";
  } else if (expiryDigits.length !== 4) {
    errors.expiryDate = "Use MM / YY format.";
  }

  if (!values.cvc.trim()) {
    errors.cvc = "CVC is required.";
  } else if (values.cvc.trim().length < 3) {
    errors.cvc = "Enter a valid CVC.";
  }

  return errors;
}
