"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthScreen } from "@/components/AuthScreen/AuthScreen";
import type { AuthScreenCopy } from "@/lib/authScreenTokens";
import { isSignedIn } from "@/lib/authSession";

/** Figma 40004799:9080 — Sign Up Screen */
const SIGN_UP_COPY: AuthScreenCopy = {
  brandTitle: "Join InkMorph",
  brandDescription:
    "Create your account and start downloading premium illustrations today.",
  formTitle: "Create your account",
  formDescription: "Start your learning journey.",
  footerPrompt: "Already registered?",
  footerLinkLabel: "Sign in",
  footerLinkHref: "/signin",
};

function resolveNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/";
  }

  return raw;
}

export function SignUpScreen() {
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

  return <AuthScreen copy={SIGN_UP_COPY} />;
}
