"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthScreen } from "@/components/AuthScreen/AuthScreen";
import type { AuthScreenCopy } from "@/lib/authScreenTokens";
import {
  buildAuthFlowHref,
  getAuthUser,
  isSignedIn,
  needsPasswordSetup,
  needsProfileSetup,
  resolveNextPath,
} from "@/lib/authSession";

/** Figma 40004799:8512 — Log in Screen */
const SIGN_IN_COPY: AuthScreenCopy = {
  brandTitle: "Welcome Back to InkMorph.",
  brandDescription:
    "Sign in to continue exploring premium illustrations, manage your downloads, and access your creative library.",
  formTitle: "Welcome back",
  formDescription: "Just jump back in where you left off.",
  footerPrompt: "Don't have an account?",
  footerLinkLabel: "Create Account",
  footerLinkHref: "/signup",
};

export function SignInScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isSignedIn()) {
      const user = getAuthUser();
      const next = searchParams.get("next");

      if (user && needsPasswordSetup(user)) {
        router.replace(buildAuthFlowHref("/set-password", { setup: true, next }));
        return;
      }

      if (user && needsProfileSetup(user)) {
        router.replace(buildAuthFlowHref("/complete-profile", { setup: true, next }));
        return;
      }

      router.replace(resolveNextPath(next));
      return;
    }

    setReady(true);
  }, [router, searchParams]);

  if (!ready) {
    return null;
  }

  return <AuthScreen copy={SIGN_IN_COPY} variant="signin" />;
}
