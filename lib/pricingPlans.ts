export interface PricingPlan {
  id: "basic" | "full-pack" | "lifetime";
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
      "Perfect for exploring InkMorph and using free 3D assets in your projects.",
    price: "Free",
    ctaLabel: "Get Started Free",
    ctaVariant: "secondary",
    includesLabel: "What’s included:",
    features: [
      "Access to selected free 3D assets",
      "5 Copy or Downloads per day",
      "Each Copy or Download uses 1 credit",
      "Free Avatars, Characters, Objects & Abstracts",
      "PNG downloads",
      "Credits refresh every 24 hours",
    ],
  },
  {
    id: "full-pack",
    name: "Full Pack",
    description: "Unlock the complete InkMorph library available today.",
    price: "$29",
    priceSuffix: "/ one-time",
    ctaLabel: "Get Full Pack",
    ctaVariant: "primary",
    includesLabel: "Everything in Free, plus:",
    features: [
      "Access to all current 3D assets",
      "Full Avatar, Character & Object library",
      "Full Abstract library",
      "Unlimited Copy & Download",
      "High-resolution & transparent PNG",
      "Commercial license",
    ],
  },
  {
    id: "lifetime",
    name: "Full Pack + Lifetime Updates",
    description:
      "Get everything in InkMorph today, plus all future assets and updates.",
    price: "$49",
    priceSuffix: "/ one-time",
    ctaLabel: "Get Lifetime Access",
    ctaVariant: "primary",
    includesLabel: "Everything in Full Pack, plus:",
    features: [
      "All future 3D assets",
      "All future library expansions",
      "Lifetime library updates",
      "Unlimited Copy & Download",
      "High-resolution & transparent PNG",
      "No additional payments",
    ],
  },
];
