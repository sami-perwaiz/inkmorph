import type { Metadata } from "next";
import { Suspense } from "react";

import { CompleteProfileScreen } from "@/components/CompleteProfileScreen/CompleteProfileScreen";
import { buildPrivatePageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPrivatePageMetadata(
  "Edit Profile",
  "Update your photo and details to keep your InkMorph profile current.",
  "/complete-profile"
);

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={null}>
      <CompleteProfileScreen />
    </Suspense>
  );
}
