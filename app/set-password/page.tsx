import type { Metadata } from "next";
import { Suspense } from "react";

import { SetPasswordScreen } from "@/components/SetPasswordScreen/SetPasswordScreen";
import { buildPrivatePageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPrivatePageMetadata(
  "Set Password",
  "Create a password to secure your InkMorph account.",
  "/set-password"
);

export default function SetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <SetPasswordScreen />
    </Suspense>
  );
}
