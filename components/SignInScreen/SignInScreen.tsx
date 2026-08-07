"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthScreen } from "@/components/AuthScreen/AuthScreen";
import type { AuthScreenCopy } from "@/lib/authScreenTokens";
import { getAuthEntryHref, hasRegisteredAccounts } from "@/lib/authSession";

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
  const [showSignIn, setShowSignIn] = useState(false);

  useEffect(() => {
    // First-time users should start on Create Account, not Sign In.
    if (!hasRegisteredAccounts()) {
      router.replace(getAuthEntryHref(searchParams.get("next")));
      return;
    }

    setShowSignIn(true);
  }, [router, searchParams]);

  if (!showSignIn) {
    return null;
  }

  return <AuthScreen copy={SIGN_IN_COPY} />;
}
