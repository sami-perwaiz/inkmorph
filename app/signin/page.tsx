import type { Metadata } from "next";
import { Suspense } from "react";

import { SignInScreen } from "@/components/SignInScreen/SignInScreen";
import { buildPrivatePageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPrivatePageMetadata(
  "Sign In",
  "Sign in to InkMorph to explore premium illustrations and manage your downloads.",
  "/signin"
);

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInScreen />
    </Suspense>
  );
}
