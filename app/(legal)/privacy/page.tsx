import type { Metadata } from "next";

import { LegalPageLayout } from "@/components/LegalPage/LegalPageLayout";
import type { LegalSection } from "@/components/LegalPage/legalPageTypes";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy — InkMorph",
  description:
    "Read the InkMorph Privacy Policy to learn how we collect, use, protect, and manage information when you use our website and services.",
  path: "/privacy",
  absoluteTitle: true,
});

const SECTIONS: readonly LegalSection[] = [
  {
    title: "Introduction",
    paragraphs: [
      "InkMorph respects your privacy and is committed to protecting the information you provide when using our website and services.",
      "This Privacy Policy explains what information we collect, how we use it, and the choices available to you.",
    ],
  },
  {
    title: "Information We Collect",
    paragraphs: ["Depending on how you use InkMorph, we may collect:"],
    list: [
      "Account information such as your name and email address when you create an account.",
      "Usage information such as assets you view, copy, download, or interact with.",
      "Subscription and plan information.",
      "Device and browser information used to improve website performance and compatibility.",
      "Basic technical information such as IP address, browser type, and operating system.",
      "Information you voluntarily provide when contacting us.",
    ],
    trailingParagraphs: [
      "We only collect information that is reasonably necessary to provide and improve InkMorph.",
    ],
  },
  {
    title: "How We Use Your Information",
    paragraphs: ["We may use collected information to:"],
    list: [
      "Provide and maintain InkMorph.",
      "Manage user accounts and subscriptions.",
      "Process downloads and enforce usage limits.",
      "Provide access to Free, Premium, and Pro features.",
      "Improve website performance and user experience.",
      "Understand how users interact with our products.",
      "Detect abuse, fraud, or unauthorized access.",
      "Respond to support requests.",
      "Communicate important service-related updates.",
    ],
  },
  {
    title: "Account Information",
    paragraphs: [
      "If you create an InkMorph account, we may store information such as your name and email address.",
      "You are responsible for keeping your account credentials secure.",
      "You may request changes to or deletion of your account information where applicable.",
    ],
  },
  {
    title: "Payments",
    paragraphs: [
      "If you purchase a paid InkMorph plan, payment information may be processed by our third-party payment provider.",
      "InkMorph does not need to store your complete payment card details.",
      "Payment providers may collect and process payment information according to their own privacy policies.",
    ],
  },
  {
    title: "Cookies and Similar Technologies",
    paragraphs: ["InkMorph may use cookies or similar technologies to:"],
    list: [
      "Keep users signed in.",
      "Remember preferences.",
      "Maintain sessions.",
      "Understand website usage.",
      "Improve performance and functionality.",
    ],
    trailingParagraphs: [
      "You can manage cookies through your browser settings, although disabling certain cookies may affect some website functionality.",
    ],
  },
  {
    title: "Third-Party Services",
    paragraphs: ["InkMorph may use trusted third-party services for things such as:"],
    list: [
      "Hosting",
      "Authentication",
      "Payments",
      "Analytics",
      "Performance monitoring",
      "Content delivery",
    ],
    trailingParagraphs: [
      "These services may process limited information as necessary to provide their services.",
    ],
  },
  {
    title: "Data Security",
    paragraphs: [
      "We use reasonable technical and organizational measures to protect information from unauthorized access, alteration, disclosure, or destruction.",
      "However, no internet-based service can guarantee absolute security.",
    ],
  },
  {
    title: "Data Retention",
    paragraphs: [
      "We retain information only for as long as reasonably necessary to provide our services, meet legal obligations, resolve disputes, and enforce our agreements.",
      "When information is no longer needed, it may be deleted or anonymized.",
    ],
  },
  {
    title: "Your Choices",
    paragraphs: ["Depending on your location and applicable laws, you may have rights to:"],
    list: [
      "Access your personal information.",
      "Correct inaccurate information.",
      "Request deletion of your information.",
      "Manage certain communications.",
      "Withdraw consent where applicable.",
    ],
    trailingParagraphs: [
      "Contact InkMorph if you would like to make a privacy-related request.",
    ],
    contactEmail: true,
  },
  {
    title: "Children's Privacy",
    paragraphs: [
      "InkMorph is not intended to knowingly collect personal information from children without appropriate authorization.",
      "If you believe a child has provided personal information to us, please contact us so we can review and take appropriate action.",
    ],
    contactEmail: true,
  },
  {
    title: "Changes to This Policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time.",
      "When changes are made, the updated version will be published on this page with a revised \"Last updated\" date.",
    ],
  },
  {
    title: "Contact",
    paragraphs: [
      "If you have questions about this Privacy Policy or how InkMorph handles your information, please contact the InkMorph team.",
    ],
    contactEmail: true,
  },
];

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="Your privacy matters. Here's how InkMorph handles your information."
      sections={SECTIONS}
    />
  );
}
