import { getAuthUser } from "@/lib/authSession";
import {
  isPaidCheckoutPlan,
  type CheckoutFormValues,
} from "@/lib/checkoutForm";
import { PRICING_PLANS, type PricingPlan } from "@/lib/pricingPlans";

export type PaidPlanId = Exclude<PricingPlan["id"], "basic">;

export interface MockCheckoutDraft {
  planId: PaidPlanId;
  fullName: string;
  email: string;
  country: string;
}

export interface MockPurchaseRecord {
  planId: PaidPlanId;
  planName: string;
  amount: string;
  orderId: string;
  status: "Paid";
  purchasedAt: string;
  customerName: string;
  email: string;
}

const DRAFT_STORAGE_KEY = "inkmorph-mock-checkout-draft";
const PURCHASES_STORAGE_KEY = "inkmorph-mock-purchases";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function formatPlanAmount(plan: PricingPlan): string {
  return plan.priceSuffix ? `${plan.price}${plan.priceSuffix}` : plan.price;
}

/** Persists non-sensitive checkout fields for the mock payment flow. Never stores card data. */
export function saveMockCheckoutDraft(
  planId: PaidPlanId,
  values: Pick<CheckoutFormValues, "fullName" | "email" | "country">
): void {
  if (!isBrowser()) {
    return;
  }

  const draft: MockCheckoutDraft = {
    planId,
    fullName: values.fullName.trim(),
    email: values.email.trim(),
    country: values.country,
  };

  sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

export function readMockCheckoutDraft(): MockCheckoutDraft | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<MockCheckoutDraft>;
    if (!isPaidCheckoutPlan(parsed.planId)) {
      return null;
    }

    return {
      planId: parsed.planId,
      fullName: typeof parsed.fullName === "string" ? parsed.fullName : "",
      email: typeof parsed.email === "string" ? parsed.email : "",
      country: typeof parsed.country === "string" ? parsed.country : "",
    };
  } catch {
    return null;
  }
}

export function clearMockCheckoutDraft(): void {
  if (!isBrowser()) {
    return;
  }

  sessionStorage.removeItem(DRAFT_STORAGE_KEY);
}

function readPurchasesStore(): Record<string, MockPurchaseRecord> {
  if (!isBrowser()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(PURCHASES_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as Record<string, Partial<MockPurchaseRecord>>;
    const store: Record<string, MockPurchaseRecord> = {};

    for (const [sub, record] of Object.entries(parsed)) {
      if (!record || !isPaidCheckoutPlan(record.planId)) {
        continue;
      }

      store[sub] = {
        planId: record.planId,
        planName: typeof record.planName === "string" ? record.planName : "",
        amount: typeof record.amount === "string" ? record.amount : "",
        orderId: typeof record.orderId === "string" ? record.orderId : "",
        status: "Paid",
        purchasedAt:
          typeof record.purchasedAt === "string"
            ? record.purchasedAt
            : new Date().toISOString(),
        customerName:
          typeof record.customerName === "string" ? record.customerName : "",
        email: typeof record.email === "string" ? record.email : "",
      };
    }

    return store;
  } catch {
    return {};
  }
}

function writePurchasesStore(store: Record<string, MockPurchaseRecord>): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(PURCHASES_STORAGE_KEY, JSON.stringify(store));
}

function generateMockOrderId(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const time = `${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
  const suffix = Math.floor(Math.random() * 9000 + 1000);

  return `#IM-${date}-${time}-${suffix}`;
}

export function getMockPurchase(sub?: string): MockPurchaseRecord | null {
  const activeSub = sub ?? getAuthUser()?.sub;
  if (!activeSub) {
    return null;
  }

  return readPurchasesStore()[activeSub] ?? null;
}

/**
 * Completes the mock checkout flow for the signed-in user.
 * Replace this with a real payment provider confirmation later.
 */
export function completeMockPurchase(planId: PaidPlanId): MockPurchaseRecord {
  const user = getAuthUser();
  if (!user) {
    throw new Error("Sign in before completing checkout.");
  }

  const plan = PRICING_PLANS.find((entry) => entry.id === planId);
  if (!plan || !isPaidCheckoutPlan(planId)) {
    throw new Error("Select a valid plan before continuing.");
  }

  const draft = readMockCheckoutDraft();
  const record: MockPurchaseRecord = {
    planId,
    planName: plan.name,
    amount: formatPlanAmount(plan),
    orderId: generateMockOrderId(),
    status: "Paid",
    purchasedAt: new Date().toISOString(),
    customerName: draft?.fullName || user.name,
    email: draft?.email || user.email,
  };

  const store = readPurchasesStore();
  store[user.sub] = record;
  writePurchasesStore(store);
  clearMockCheckoutDraft();

  return record;
}
