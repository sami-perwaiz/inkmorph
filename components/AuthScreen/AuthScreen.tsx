"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { BackButton } from "@/components/BackButton/BackButton";
import { InkMorphLogo } from "@/components/InkMorphLogo/InkMorphLogo";
import {
  AUTH_AVATARS,
  AUTH_SCREEN,
  type AuthScreenCopy,
} from "@/lib/authScreenTokens";
import {
  AuthConflictError,
  completeGoogleSignIn,
  needsProfileSetup,
} from "@/lib/authSession";
import { signInWithGoogle } from "@/lib/googleAuth";

function BrandLogo() {
  return (
    <Link
      href="/"
      aria-label="InkMorph home"
      className="absolute z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2"
      style={{
        top: AUTH_SCREEN.logoInset,
        left: AUTH_SCREEN.logoInset,
      }}
    >
      <InkMorphLogo
        size={AUTH_SCREEN.logoSize}
        radius={AUTH_SCREEN.logoRadius}
        alt=""
      />
    </Link>
  );
}

function TrustAvatars() {
  return (
    <div
      className="flex items-center"
      style={{
        gap: AUTH_SCREEN.trustPillGap,
        paddingTop: AUTH_SCREEN.trustPillPadY,
        paddingBottom: AUTH_SCREEN.trustPillPadY,
        paddingLeft: AUTH_SCREEN.trustPillPadLeft,
        paddingRight: AUTH_SCREEN.trustPillPadRight,
        borderRadius: AUTH_SCREEN.trustPillRadius,
        backgroundImage:
          "linear-gradient(90deg, #FFFFFF 0%, rgba(255,255,255,0) 100%)",
      }}
    >
      <div className="flex items-center pr-1">
        {AUTH_AVATARS.map((avatar, index) => {
          const isLast = index === AUTH_AVATARS.length - 1;

          return (
            <div
              key={avatar.src}
              className="relative shrink-0 overflow-hidden rounded-full"
              style={{
                width: AUTH_SCREEN.avatarSize,
                height: AUTH_SCREEN.avatarSize,
                marginRight: isLast ? 0 : -AUTH_SCREEN.avatarOverlap,
                backgroundColor: avatar.bg,
              }}
            >
              <img
                src={avatar.src}
                alt=""
                width={AUTH_SCREEN.avatarSize}
                height={AUTH_SCREEN.avatarSize}
                className="size-full object-cover object-top"
                aria-hidden
              />
            </div>
          );
        })}
      </div>
      <p
        className="whitespace-nowrap font-inter text-xs font-medium leading-[18px] tracking-[0.12px]"
        style={{ color: AUTH_SCREEN.caption }}
      >
        Trusted by Designers &amp; Creators
      </p>
    </div>
  );
}

function resolveNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/";
  }

  return raw;
}

function resolveAuthErrorMessage(error: unknown): string | null {
  if (!(error instanceof Error)) {
    return "Google sign-in failed. Please try again.";
  }

  const message = error.message;

  if (/cancel|closed|popup|access_denied|popup_closed/i.test(message)) {
    return null;
  }

  if (/GOOGLE_CLIENT_ID|Client ID/i.test(message)) {
    return "Google sign-in is not configured yet. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID and redeploy.";
  }

  if (error instanceof AuthConflictError) {
    return message;
  }

  if (/missing required profile fields|usable email/i.test(message)) {
    return "Your Google account must include a verified email address to continue.";
  }

  if (/Identity Services|load Google/i.test(message)) {
    return "Unable to load Google sign-in. Check your connection and try again.";
  }

  return message || "Google sign-in failed. Please try again.";
}

interface AuthScreenProps {
  copy: AuthScreenCopy;
}

export function AuthScreen({ copy }: AuthScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleSignIn = useCallback(async () => {
    if (isAuthenticating) {
      return;
    }

    setIsAuthenticating(true);
    setAuthError(null);

    try {
      const googleProfile = await signInWithGoogle();
      const { user, isNewAccount } = completeGoogleSignIn(googleProfile);
      const destination =
        isNewAccount || needsProfileSetup(user)
          ? "/complete-profile?setup=1"
          : resolveNextPath(searchParams.get("next"));

      router.push(destination);
    } catch (error) {
      const message = resolveAuthErrorMessage(error);
      if (!message) {
        return;
      }

      console.error(error);
      setAuthError(message);
    } finally {
      setIsAuthenticating(false);
    }
  }, [isAuthenticating, router, searchParams]);

  return (
    <main className="relative flex min-h-screen flex-col bg-white tablet:flex-row">
      <section className="relative flex min-h-[420px] w-full flex-1 flex-col overflow-hidden tablet:min-h-screen tablet:w-1/2">
        <div className="absolute inset-0 overflow-hidden">
          <picture>
            <source
              media="(max-width: 767px)"
              srcSet={AUTH_SCREEN.heroBgSm}
              type="image/webp"
            />
            <img
              src={AUTH_SCREEN.heroBg}
              alt=""
              decoding="async"
              fetchPriority="high"
              className="h-full w-full object-cover"
              aria-hidden
            />
          </picture>
        </div>
        <BrandLogo />

        <div
          className="relative z-10 mt-auto flex w-full max-w-[404px] flex-col"
          style={{
            gap: AUTH_SCREEN.brandStackGap,
            padding: AUTH_SCREEN.brandPadding,
          }}
        >
          <TrustAvatars />
          <div className="flex w-full flex-col gap-2">
            <h1 className="font-inter text-[40px] font-normal leading-[48px] tracking-[-1.2px] text-black tablet:text-[48px] tablet:leading-[56px] tablet:tracking-[-1.44px]">
              {copy.brandTitle}
            </h1>
            <p
              className="font-inter text-base font-normal leading-7"
              style={{ color: AUTH_SCREEN.muted }}
            >
              {copy.brandDescription}
            </p>
          </div>
        </div>
      </section>

      <section className="relative flex w-full flex-1 flex-col bg-white tablet:min-h-screen tablet:w-1/2">
        <div className="flex w-full shrink-0 justify-start p-[30px] pb-0">
          <BackButton href="/" ariaLabel="Back to home" />
        </div>

        <div className="flex w-full flex-1 items-center justify-center px-5 py-16 tablet:px-8 tablet:py-8">
          <div
            className="flex w-full flex-col items-start"
            style={{
              maxWidth: AUTH_SCREEN.formWidth,
              gap: AUTH_SCREEN.formStackGap,
            }}
          >
            <div
              className="flex w-full flex-col items-center text-center"
              style={{ gap: AUTH_SCREEN.formHeaderGap }}
            >
              <h2
                className="w-full font-inter text-[30px] font-medium leading-[38px] tracking-[-0.3px]"
                style={{ color: AUTH_SCREEN.heading }}
              >
                {copy.formTitle}
              </h2>
              <p
                className="w-full font-inter text-base font-normal leading-7"
                style={{ color: AUTH_SCREEN.muted }}
              >
                {copy.formDescription}
              </p>
            </div>

            <div
              className="flex w-full flex-col"
              style={{ gap: AUTH_SCREEN.formBodyGap }}
            >
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isAuthenticating}
                className="inline-flex w-full items-center justify-center gap-3 border border-solid bg-white font-inter text-sm font-medium leading-[22px] transition-colors hover:bg-gray-100/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                style={{
                  height: AUTH_SCREEN.socialButtonHeight,
                  borderRadius: AUTH_SCREEN.socialButtonRadius,
                  borderColor: AUTH_SCREEN.socialButtonBorder,
                  color: AUTH_SCREEN.socialButtonText,
                  paddingLeft: 16,
                  paddingRight: 16,
                }}
              >
                <GoogleIcon />
                {isAuthenticating
                  ? "Continuing with Google…"
                  : "Continue with Google"}
              </button>

              {authError ? (
                <p
                  role="alert"
                  className="w-full text-center font-inter text-sm font-normal leading-[22px] text-[#F04438]"
                >
                  {authError}
                </p>
              ) : null}

              <p className="flex w-full flex-wrap items-start justify-center gap-2 text-center font-inter text-sm leading-[22px]">
                <span
                  className="font-normal"
                  style={{ color: AUTH_SCREEN.caption }}
                >
                  {copy.footerPrompt}
                </span>
                <Link
                  href={copy.footerLinkHref}
                  className="font-medium focus-visible:outline-none focus-visible:underline"
                  style={{ color: AUTH_SCREEN.linkColor }}
                >
                  {copy.footerLinkLabel}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
