import type { Metadata } from "next";
import { Suspense } from "react";

import { SignInScreen } from "@/components/SignInScreen/SignInScreen";

export const metadata: Metadata = {
  title: "Welcome back",
  description:
    "Sign in to InkMorph to explore premium illustrations and manage your downloads.",
};

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInScreen />
    </Suspense>
  );
}
