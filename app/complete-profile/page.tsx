import type { Metadata } from "next";
import { Suspense } from "react";

import { CompleteProfileScreen } from "@/components/CompleteProfileScreen/CompleteProfileScreen";

export const metadata: Metadata = {
  title: "Edit profile",
  description:
    "Update your photo and details to keep your InkMorph profile current.",
};

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={null}>
      <CompleteProfileScreen />
    </Suspense>
  );
}
