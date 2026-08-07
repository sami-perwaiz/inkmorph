export interface PricingPlan {
  id: "basic" | "pro";
  name: string;
  description: string;
  price: string;
  priceSuffix?: string;
  ctaLabel: string;
  ctaVariant: "secondary" | "primary";
  includesLabel: string;
  features: string[];
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "basic",
    name: "Basic",
    description:
      "Perfect for exploring InkMorph and using illustrations in personal or small projects.",
    price: "Free",
    ctaLabel: "Get Started Free",
    ctaVariant: "secondary",
    includesLabel: "What’s included:",
    features: [
      "5 free credits every day",
      "Each Copy or Download uses 1 credit",
      "Access to a limited illustration library",
      "PNG downloads in 1× quality",
      "New credits refresh every 24 hours",
      "1 transparent PNG download per day",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description:
      "Unlock the complete InkMorph experience for creators and professionals.",
    price: "$9.99",
    priceSuffix: "/month",
    ctaLabel: "Purchase plan",
    ctaVariant: "primary",
    includesLabel: "Everything in Basic, plus:",
    features: [
      "Unlimited credits",
      "Unlimited Copy & Download",
      "Access to the entire illustration library",
      "PNG downloads in 2× quality",
      "Unlimited transparent background PNG downloads",
      "Commercial license",
    ],
  },
];
