import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "InkMorph privacy policy.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 px-6 py-16">
      <Link
        href="/"
        className="font-poppins text-sm text-gray-600 underline underline-offset-2 hover:text-gray-900"
      >
        ← Back to gallery
      </Link>
      <h1 className="font-lora text-4xl font-normal text-black">
        Privacy Policy
      </h1>
      <p className="font-poppins text-base leading-7 text-[#797979]">
        We respect your privacy. InkMorph collects only the information needed
        to provide the gallery experience, account features, and product
        analytics. This page will be updated with full policy details soon.
      </p>
    </main>
  );
}
