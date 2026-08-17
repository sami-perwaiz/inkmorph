import type { Metadata } from "next";
import { Suspense } from "react";

import { SignUpScreen } from "@/components/SignUpScreen/SignUpScreen";
import { buildPrivatePageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPrivatePageMetadata(
  "Create Account",
  "Join InkMorph and start downloading premium 3D icons, illustrations and wallpapers.",
  "/signup"
);

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpScreen />
    </Suspense>
  );
}
