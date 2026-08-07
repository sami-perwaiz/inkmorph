import type { Metadata } from "next";
import { Suspense } from "react";

import { SignUpScreen } from "@/components/SignUpScreen/SignUpScreen";

export const metadata: Metadata = {
  title: "Create your account",
  description:
    "Join InkMorph and start downloading premium illustrations today.",
};

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpScreen />
    </Suspense>
  );
}
