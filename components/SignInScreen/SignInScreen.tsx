import { AuthScreen } from "@/components/AuthScreen/AuthScreen";
import type { AuthScreenCopy } from "@/lib/authScreenTokens";

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
  return <AuthScreen copy={SIGN_IN_COPY} />;
}
