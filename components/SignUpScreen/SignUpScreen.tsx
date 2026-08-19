"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { AuthScreen } from "@/components/AuthScreen/AuthScreen";
import type { AuthScreenCopy } from "@/lib/authScreenTokens";
import { AUTH_CHANGE_EVENT, isAuthReady, isSignedIn, resolveNextPath } from "@/lib/authSession";

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

export function SignUpScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const evaluate = () => {
      if (!isAuthReady()) {
        return;
      }

      if (isSignedIn()) {
        router.replace(resolveNextPath(searchParams.get("next")));
        return;
      }

      setReady(true);
    };

    evaluate();
    window.addEventListener(AUTH_CHANGE_EVENT, evaluate);
    return () => window.removeEventListener(AUTH_CHANGE_EVENT, evaluate);
  }, [router, searchParams]);

  if (!ready) {
    return null;
  }

  return <AuthScreen copy={SIGN_UP_COPY} />;
}
