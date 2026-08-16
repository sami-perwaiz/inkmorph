"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthScreen } from "@/components/AuthScreen/AuthScreen";
import type { AuthScreenCopy } from "@/lib/authScreenTokens";
import { isSignedIn } from "@/lib/authSession";

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

function resolveNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/";
  }

  return raw;
}

export function SignInScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isSignedIn()) {
      router.replace(resolveNextPath(searchParams.get("next")));
      return;
    }

    setReady(true);
  }, [router, searchParams]);

  if (!ready) {
    return null;
  }

  return <AuthScreen copy={SIGN_IN_COPY} />;
}
