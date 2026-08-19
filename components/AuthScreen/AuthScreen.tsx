"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, type CSSProperties, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";

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

export type AuthScreenVariant = "signin" | "signup";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AuthField({
  id,
  label,
  labelGapClassName,
  error,
  children,
}: {
  id: string;
  label: string;
  labelGapClassName?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className={`flex w-full flex-col ${labelGapClassName ?? "gap-1"}`}>
      <label
        htmlFor={id}
        className="font-inter text-sm font-medium leading-[22px]"
        style={{ color: AUTH_SCREEN.labelColor }}
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="font-inter text-sm leading-[22px] text-[#F04438]">{error}</p>
      ) : null}
    </div>
  );
}

function AuthInput({
  id,
  error,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  error?: boolean;
}) {
  return (
    <input
      id={id}
      className={`w-full border border-solid bg-white px-3.5 py-2.5 font-inter text-base font-normal leading-7 outline-none placeholder:text-[#A3A3A3] focus-visible:ring-2 focus-visible:ring-[#057AF0]/25 ${className}`}
      style={{
        borderColor: error ? "#F04438" : AUTH_SCREEN.inputBorder,
        borderRadius: AUTH_SCREEN.socialButtonRadius,
        boxShadow: AUTH_SCREEN.inputShadow,
        color: AUTH_SCREEN.labelColor,
      }}
      {...props}
    />
  );
}

function BrandLogo({
  className = "",
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Link
      href="/"
      aria-label="InkMorph home"
      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 ${className}`}
      style={style}
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
  variant?: AuthScreenVariant;
}

export function AuthScreen({ copy, variant = "signup" }: AuthScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const isSignIn = variant === "signin";

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

  const handleSignInSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const trimmedEmail = email.trim();
      let hasError = false;

      if (!trimmedEmail) {
        setEmailError("Enter your email address.");
        hasError = true;
      } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
        setEmailError("Enter a valid email address.");
        hasError = true;
      } else {
        setEmailError(null);
      }

      if (!password) {
        setPasswordError("Enter your password.");
        hasError = true;
      } else {
        setPasswordError(null);
      }

      if (hasError) {
        return;
      }

      setAuthError("Email sign-in is not available yet. Please use Sign in with Google.");
    },
    [email, password],
  );

  const googleButtonLabel = isSignIn
    ? isAuthenticating
      ? "Signing in with Google…"
      : "Sign in with Google"
    : isAuthenticating
      ? "Continuing with Google…"
      : "Continue with Google";

  const googleButtonClassName = isSignIn
    ? "inline-flex w-full items-center justify-center gap-3 border border-solid bg-white px-4 font-inter text-sm font-medium leading-[22px] transition-colors hover:bg-gray-100/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
    : "inline-flex w-fit max-w-full items-center justify-center gap-3 border border-solid bg-white px-4 font-inter text-sm font-medium leading-[22px] transition-colors hover:bg-gray-100/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 desktop:w-full";

  return (
    <main className="relative flex min-h-screen flex-col bg-white desktop:flex-row">
      <BackButton
        ariaLabel="Back to home"
        useHistoryBack
        fallbackHref="/"
        className="fixed left-[30px] top-[30px] z-20 desktop:hidden"
      />
      <BrandLogo className="fixed right-[30px] top-[30px] z-20 desktop:hidden" />

      <section className="relative hidden min-h-screen w-1/2 flex-col overflow-hidden bg-white desktop:flex">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={AUTH_SCREEN.heroBg}
            alt=""
            decoding="async"
            fetchPriority="high"
            className="h-full w-full object-cover"
            aria-hidden
          />
        </div>
        <BrandLogo
          className="absolute z-10"
          style={{
            top: AUTH_SCREEN.logoInset,
            left: AUTH_SCREEN.logoInset,
          }}
        />

        <div
          className="relative z-10 mt-auto flex w-full max-w-[404px] flex-col"
          style={{
            gap: AUTH_SCREEN.brandStackGap,
            padding: AUTH_SCREEN.brandPadding,
          }}
        >
          <TrustAvatars />
          <div className="flex w-full flex-col gap-2">
            <h1 className="font-inter text-[48px] font-normal leading-[56px] tracking-[-1.44px] text-black">
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

      <section className="relative flex min-h-screen w-full flex-1 items-center justify-center bg-white px-5 desktop:min-h-screen desktop:w-1/2 desktop:px-8 desktop:py-16">
        <BackButton
          ariaLabel="Back to home"
          useHistoryBack
          fallbackHref="/"
          className="absolute left-[30px] top-[30px] z-10 hidden desktop:inline-flex"
        />
        <div
          className="mx-auto flex w-full max-w-[408px] flex-col items-center desktop:items-start"
          style={{
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
              className="flex w-full flex-col items-center desktop:items-stretch"
              style={{ gap: AUTH_SCREEN.formBodyGap }}
            >
              {isSignIn ? (
                <form
                  className="flex w-full flex-col"
                  style={{ gap: AUTH_SCREEN.formStackGap }}
                  onSubmit={handleSignInSubmit}
                  noValidate
                >
                  <div
                    className="flex w-full flex-col"
                    style={{ gap: AUTH_SCREEN.formCredentialsGap }}
                  >
                    <AuthField
                      id="signin-email"
                      label="Email"
                      labelGapClassName="gap-1"
                      error={emailError ?? undefined}
                    >
                      <AuthInput
                        id="signin-email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        placeholder="Enter your email address"
                        value={email}
                        error={Boolean(emailError)}
                        onChange={(event) => {
                          setEmail(event.target.value);
                          if (emailError) {
                            setEmailError(null);
                          }
                        }}
                      />
                    </AuthField>

                    <AuthField
                      id="signin-password"
                      label="Password"
                      labelGapClassName="gap-1.5"
                      error={passwordError ?? undefined}
                    >
                      <div className="relative w-full">
                        <AuthInput
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          autoComplete="current-password"
                          placeholder="Enter password"
                          value={password}
                          error={Boolean(passwordError)}
                          className="pr-11"
                          onChange={(event) => {
                            setPassword(event.target.value);
                            if (passwordError) {
                              setPasswordError(null);
                            }
                          }}
                        />
                        <button
                          type="button"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          aria-pressed={showPassword}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#057AF0]/25"
                          onClick={() => setShowPassword((current) => !current)}
                        >
                          <Image
                            src="/icons/eye-off.svg"
                            alt=""
                            width={17}
                            height={17}
                            aria-hidden
                          />
                        </button>
                      </div>
                    </AuthField>
                  </div>

                  <div
                    className="flex w-full flex-col"
                    style={{ gap: AUTH_SCREEN.formSocialGap }}
                  >
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center rounded-lg font-inter text-base font-medium leading-7 text-white transition-colors hover:bg-[#0468cc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#057AF0]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                      style={{
                        height: AUTH_SCREEN.socialButtonHeight,
                        backgroundColor: AUTH_SCREEN.primary,
                      }}
                    >
                      Sign In
                    </button>

                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isAuthenticating}
                      className={googleButtonClassName}
                      style={{
                        height: AUTH_SCREEN.socialButtonHeight,
                        borderRadius: AUTH_SCREEN.socialButtonRadius,
                        borderColor: AUTH_SCREEN.socialButtonBorder,
                        color: AUTH_SCREEN.socialButtonText,
                      }}
                    >
                      <GoogleIcon />
                      {googleButtonLabel}
                    </button>

                    {authError ? (
                      <p
                        role="alert"
                        className="w-full text-center font-inter text-sm font-normal leading-[22px] text-[#F04438]"
                      >
                        {authError}
                      </p>
                    ) : null}

                    <p className="flex w-full flex-wrap items-center justify-center gap-2 text-center font-inter text-sm leading-[22px]">
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
                </form>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isAuthenticating}
                    className={googleButtonClassName}
                    style={{
                      height: AUTH_SCREEN.socialButtonHeight,
                      borderRadius: AUTH_SCREEN.socialButtonRadius,
                      borderColor: AUTH_SCREEN.socialButtonBorder,
                      color: AUTH_SCREEN.socialButtonText,
                    }}
                  >
                    <GoogleIcon />
                    {googleButtonLabel}
                  </button>

                  {authError ? (
                    <p
                      role="alert"
                      className="w-full text-center font-inter text-sm font-normal leading-[22px] text-[#F04438]"
                    >
                      {authError}
                    </p>
                  ) : null}

                  <p className="flex w-full flex-wrap items-center justify-center gap-2 text-center font-inter text-sm leading-[22px]">
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
                </>
              )}
            </div>
          </div>
      </section>
    </main>
  );
}
