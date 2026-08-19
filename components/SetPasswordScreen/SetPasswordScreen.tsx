"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

import { BackButton } from "@/components/BackButton/BackButton";
import { InkMorphLogo } from "@/components/InkMorphLogo/InkMorphLogo";
import { AUTH_SCREEN } from "@/lib/authScreenTokens";
import {
  buildAuthFlowHref,
  getAuthEntryHref,
  getAuthUser,
  isSignedIn,
  needsPasswordSetup,
  needsProfileSetup,
  resolveNextPath,
  setAccountPassword,
} from "@/lib/authSession";

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

function PasswordToggleButton({
  showPassword,
  onToggle,
}: {
  showPassword: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={showPassword ? "Hide password" : "Show password"}
      aria-pressed={showPassword}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#057AF0]/25"
      onClick={onToggle}
    >
      <Image
        src="/icons/eye-off.svg"
        alt=""
        width={20}
        height={20}
        aria-hidden
      />
    </button>
  );
}

export function SetPasswordScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(
    null
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextPath = resolveNextPath(searchParams.get("next"));

  useEffect(() => {
    if (!isSignedIn()) {
      router.replace(getAuthEntryHref(buildAuthFlowHref("/set-password", { next: nextPath })));
      return;
    }

    const user = getAuthUser();
    if (!user) {
      router.replace(getAuthEntryHref(buildAuthFlowHref("/set-password", { next: nextPath })));
      return;
    }

    if (!needsPasswordSetup(user)) {
      if (needsProfileSetup(user)) {
        router.replace(
          buildAuthFlowHref("/complete-profile", {
            setup: true,
            next: nextPath,
          })
        );
        return;
      }

      router.replace(nextPath);
      return;
    }

    setReady(true);
  }, [nextPath, router]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      let hasError = false;

      if (!password) {
        setPasswordError("Enter your password.");
        hasError = true;
      } else {
        setPasswordError(null);
      }

      if (!confirmPassword) {
        setConfirmPasswordError("Confirm your password.");
        hasError = true;
      } else if (password !== confirmPassword) {
        setConfirmPasswordError("Passwords do not match.");
        hasError = true;
      } else {
        setConfirmPasswordError(null);
      }

      if (hasError) {
        return;
      }

      const user = getAuthUser();
      if (!user) {
        router.replace(getAuthEntryHref());
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        await setAccountPassword(password, user.sub);

        if (needsProfileSetup(user)) {
          router.push(
            buildAuthFlowHref("/complete-profile", {
              setup: true,
              next: nextPath,
            })
          );
          return;
        }

        router.push(nextPath);
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : "Unable to save your password. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [confirmPassword, nextPath, password, router]
  );

  if (!ready) {
    return null;
  }

  return (
    <main className="relative flex min-h-screen flex-col bg-white">
      <BackButton
        ariaLabel="Back"
        useHistoryBack
        fallbackHref={nextPath}
        className="fixed left-[30px] top-[30px] z-20"
      />

      <Link
        href="/"
        aria-label="InkMorph home"
        className="fixed right-[30px] top-[30px] z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2"
      >
        <InkMorphLogo
          size={AUTH_SCREEN.logoSize}
          radius={AUTH_SCREEN.logoRadius}
          alt=""
        />
      </Link>

      <section className="flex min-h-screen flex-1 items-center justify-center px-5 tablet:px-8">
        <form
          className="mx-auto flex w-full max-w-[408px] flex-col"
          style={{ gap: AUTH_SCREEN.formStackGap }}
          onSubmit={handleSubmit}
          noValidate
        >
          <div
            className="flex w-full flex-col items-center text-center"
            style={{ gap: AUTH_SCREEN.formHeaderGap }}
          >
            <h1
              className="w-full font-inter text-[30px] font-medium leading-[38px] tracking-[-0.3px]"
              style={{ color: AUTH_SCREEN.heading }}
            >
              Set your password
            </h1>
            <p
              className="w-full font-inter text-base font-normal leading-7"
              style={{ color: AUTH_SCREEN.muted }}
            >
              Create a password to secure your account.
            </p>
          </div>

          <div
            className="flex w-full flex-col"
            style={{ gap: AUTH_SCREEN.formSocialGap }}
          >
            <div
              className="flex w-full flex-col"
              style={{ gap: AUTH_SCREEN.formCredentialsGap }}
            >
              <AuthField
                id="set-password"
                label="Password"
                labelGapClassName="gap-1.5"
                error={passwordError ?? undefined}
              >
                <div className="relative w-full">
                  <AuthInput
                    id="set-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="new-password"
                    placeholder="Create a secure password"
                    value={password}
                    error={Boolean(passwordError)}
                    className="pr-11"
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (passwordError) {
                        setPasswordError(null);
                      }
                      if (confirmPasswordError === "Passwords do not match.") {
                        setConfirmPasswordError(null);
                      }
                    }}
                  />
                  <PasswordToggleButton
                    showPassword={showPassword}
                    onToggle={() => setShowPassword((current) => !current)}
                  />
                </div>
              </AuthField>

              <AuthField
                id="set-password-confirm"
                label="Confirm Password"
                labelGapClassName="gap-1.5"
                error={confirmPasswordError ?? undefined}
              >
                <div className="relative w-full">
                  <AuthInput
                    id="set-password-confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    error={Boolean(confirmPasswordError)}
                    className="pr-11"
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      if (confirmPasswordError) {
                        setConfirmPasswordError(null);
                      }
                    }}
                  />
                  <PasswordToggleButton
                    showPassword={showConfirmPassword}
                    onToggle={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                  />
                </div>
              </AuthField>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-lg font-inter text-base font-medium leading-7 text-white transition-colors hover:bg-[#0468cc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#057AF0]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              style={{
                height: AUTH_SCREEN.socialButtonHeight,
                backgroundColor: AUTH_SCREEN.primary,
              }}
            >
              {isSubmitting ? "Saving…" : "Set New Password"}
            </button>

            {submitError ? (
              <p
                role="alert"
                className="w-full text-center font-inter text-sm font-normal leading-[22px] text-[#F04438]"
              >
                {submitError}
              </p>
            ) : null}
          </div>
        </form>
      </section>
    </main>
  );
}
