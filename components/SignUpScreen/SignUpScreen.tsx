import { AuthScreen } from "@/components/AuthScreen/AuthScreen";
import type { AuthScreenCopy } from "@/lib/authScreenTokens";

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
  afterAuthHref: "/complete-profile?setup=1",
};

export function SignUpScreen() {
  return <AuthScreen copy={SIGN_UP_COPY} />;
}
