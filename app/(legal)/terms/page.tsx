import type { Metadata } from "next";

import { LegalPageLayout } from "@/components/LegalPage/LegalPageLayout";
import type { LegalSection } from "@/components/LegalPage/legalPageTypes";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Service — InkMorph",
  description:
    "Read the InkMorph Terms of Service covering accounts, Free and Premium plans, subscriptions, asset usage, intellectual property, and responsible use of the platform.",
  path: "/terms",
  absoluteTitle: true,
});

const SECTIONS: readonly LegalSection[] = [
  {
    title: "Acceptance of Terms",
    paragraphs: [
      "By accessing or using InkMorph, you agree to these Terms of Service.",
      "If you do not agree with these terms, please do not use the website or its services.",
      "These terms apply to all visitors, free users, and paid subscribers.",
    ],
  },
  {
    title: "Using InkMorph",
    paragraphs: [
      "You may use InkMorph to browse, discover, copy, download, and use digital assets according to your account, plan, and the applicable asset license.",
      "You agree to use InkMorph responsibly and only for lawful purposes.",
      "You must not attempt to interfere with, disrupt, or gain unauthorized access to the website or its systems.",
    ],
  },
  {
    title: "Accounts",
    paragraphs: [
      "Some InkMorph features may require an account.",
      "When creating an account, you agree to provide accurate information and keep your account details secure.",
      "You are responsible for activity performed through your account.",
      "Do not share your account credentials or use another person's account without permission.",
    ],
  },
  {
    title: "Free Plan",
    paragraphs: [
      "InkMorph may provide limited access to assets and features through a Free Plan.",
      "Free Plan limits may include:",
    ],
    list: [
      "Daily copy or download limits.",
      "Limited access to certain assets.",
      "Limited access to packs or premium content.",
      "Restrictions on bulk downloads.",
    ],
    trailingParagraphs: [
      "Free Plan limits may change over time as InkMorph evolves.",
      "The current limits displayed on the website are the limits that apply to your use of the Free Plan.",
    ],
  },
  {
    title: "Premium and Pro Plans",
    paragraphs: [
      "Paid plans provide additional access and features according to the plan selected by the user.",
      "Premium or Pro features may include:",
    ],
    list: [
      "Access to premium assets.",
      "Higher or unlimited download access according to the plan.",
      "Full pack access.",
      "Bulk or Download All functionality.",
      "Additional asset formats or features where offered.",
    ],
    trailingParagraphs: [
      "Features included in each plan are described on the InkMorph pricing page.",
      "InkMorph may update plan features or pricing in the future. Changes will not remove access to benefits already provided for a completed billing period unless required by law or otherwise agreed.",
    ],
  },
  {
    title: "Payments and Subscriptions",
    paragraphs: [
      "Paid subscriptions are processed through the payment provider available during checkout.",
      "By purchasing a subscription, you authorize the applicable payment provider to process the payment according to the selected plan.",
      "Subscription pricing, billing frequency, renewal terms, and cancellation options are presented during checkout.",
      "If a subscription automatically renews, it will continue until cancelled.",
    ],
  },
  {
    title: "Cancellation",
    paragraphs: [
      "You may cancel your subscription according to the cancellation options provided by InkMorph or its payment provider.",
      "After cancellation, access to paid features may continue until the end of the applicable billing period unless otherwise stated.",
      "Cancellation does not automatically entitle you to a refund unless a refund is required under applicable law or explicitly provided by InkMorph.",
    ],
  },
  {
    title: "Refunds",
    paragraphs: [
      "Refund eligibility depends on the refund policy applicable to your purchase and the requirements of applicable law.",
      "If you believe you are eligible for a refund, contact the InkMorph team with your purchase details.",
    ],
    contactEmail: true,
  },
  {
    title: "Asset Usage",
    paragraphs: [
      "Assets downloaded from InkMorph are subject to the InkMorph License.",
      "You may use assets only within the permissions granted by the applicable license.",
      "You may not:",
    ],
    list: [
      "Resell original InkMorph assets as standalone files.",
      "Redistribute or share original asset files.",
      "Upload InkMorph assets to another asset marketplace or library.",
      "Claim InkMorph's original artwork as your own.",
      "Use InkMorph assets to create a competing asset library.",
      "Circumvent access restrictions or download limits.",
    ],
    trailingParagraphs: [
      "For complete usage permissions, refer to the InkMorph License.",
    ],
  },
  {
    title: "Intellectual Property",
    paragraphs: [
      "InkMorph and its licensors retain ownership of the website, original artwork, branding, software, content, and other intellectual property unless otherwise stated.",
      "Using InkMorph does not transfer ownership of InkMorph's intellectual property to you.",
      "The InkMorph name, logo, branding, and website design may not be copied or used in a way that suggests an unauthorized association with InkMorph.",
    ],
  },
  {
    title: "Prohibited Activities",
    paragraphs: ["You must not:"],
    list: [
      "Attempt to bypass Free Plan limits.",
      "Circumvent Premium or Pro access controls.",
      "Scrape or systematically download the asset library.",
      "Use automated systems to abuse downloads or website resources.",
      "Reverse engineer or interfere with the website's security systems.",
      "Upload malicious code or content.",
      "Use InkMorph for unlawful or fraudulent activities.",
      "Abuse, attack, or disrupt the service.",
    ],
    trailingParagraphs: [
      "InkMorph may restrict or suspend access when necessary to protect the service and its users.",
    ],
  },
  {
    title: "Service Availability",
    paragraphs: [
      "InkMorph aims to provide a reliable service but does not guarantee that the website will always be available, uninterrupted, or error-free.",
      "Maintenance, updates, technical issues, or circumstances outside our control may temporarily affect availability.",
      "We may modify, suspend, or discontinue features when reasonably necessary.",
    ],
  },
  {
    title: "User Content",
    paragraphs: [
      "If InkMorph allows users to submit content, you remain responsible for the content you provide.",
      "You must have the necessary rights and permissions to submit that content.",
      "Do not upload content that is unlawful, infringing, harmful, or violates another person's rights.",
    ],
  },
  {
    title: "Account Suspension or Termination",
    paragraphs: [
      "InkMorph may suspend or terminate an account if there is a serious or repeated violation of these Terms, abuse of the service, fraudulent activity, or unauthorized access attempts.",
      "Where appropriate, InkMorph may provide notice before taking action.",
      "Termination does not remove obligations that are intended to continue after termination, including applicable intellectual property and licensing obligations.",
    ],
  },
  {
    title: "Disclaimer",
    paragraphs: [
      "InkMorph provides the website and services on an \"as available\" basis.",
      "To the extent permitted by applicable law, InkMorph does not guarantee that every feature, asset, or service will always be available or error-free.",
      "Nothing in these Terms limits rights or protections that cannot legally be excluded.",
    ],
  },
  {
    title: "Limitation of Liability",
    paragraphs: [
      "To the extent permitted by applicable law, InkMorph will not be responsible for indirect, incidental, special, or consequential losses arising from the use of the website or services.",
      "Nothing in these Terms excludes liability that cannot legally be excluded.",
    ],
  },
  {
    title: "Changes to These Terms",
    paragraphs: [
      "InkMorph may update these Terms of Service when necessary.",
      "When changes are made, the updated version will be published on this page with a revised \"Last updated\" date.",
      "Your continued use of InkMorph after changes become effective means you accept the updated Terms, to the extent permitted by applicable law.",
    ],
  },
  {
    title: "Contact",
    paragraphs: [
      "If you have questions about these Terms of Service, your account, subscription, or use of InkMorph assets, please contact the InkMorph team.",
    ],
    contactEmail: true,
  },
];

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      subtitle="The terms that keep InkMorph simple, fair, and safe for everyone."
      sections={SECTIONS}
    />
  );
}
