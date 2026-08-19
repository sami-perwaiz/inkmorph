"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { BackButton } from "@/components/BackButton/BackButton";
import { InkMorphLogo } from "@/components/InkMorphLogo/InkMorphLogo";
import {
  buildAuthFlowHref,
  getAuthEntryHref,
  getAuthUser,
  isSignedIn,
  markProfileComplete,
  needsPasswordSetup,
} from "@/lib/authSession";
import {
  COMPLETE_PROFILE,
  PROFILE_PRESETS,
} from "@/lib/completeProfileTokens";
import {
  DEFAULT_PROFILE_AVATAR,
  isCustomAvatarSrc,
  readFileAsDataUrl,
  readUserProfile,
  writeUserProfile,
} from "@/lib/userProfile";

export function CompleteProfileScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSetupFlow = useMemo(
    () => searchParams.get("setup") === "1",
    [searchParams]
  );
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarSrc, setAvatarSrc] = useState(DEFAULT_PROFILE_AVATAR);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn()) {
      router.replace(getAuthEntryHref());
      return;
    }

    const authUser = getAuthUser();
    if (authUser && needsPasswordSetup(authUser)) {
      router.replace(
        buildAuthFlowHref("/set-password", {
          setup: isSetupFlow,
          next: searchParams.get("next"),
        })
      );
      return;
    }

    const profile = readUserProfile();
    const savedName = profile.fullName.trim();

    setFullName(savedName || authUser?.name || "");
    setEmail(authUser?.email ?? "");

    const savedAvatar =
      profile.avatarSrc && profile.avatarSrc !== DEFAULT_PROFILE_AVATAR
        ? profile.avatarSrc
        : null;

    setAvatarSrc(
      savedAvatar || authUser?.picture || DEFAULT_PROFILE_AVATAR
    );

    if (
      PROFILE_PRESETS.includes(
        profile.avatarSrc as (typeof PROFILE_PRESETS)[number]
      )
    ) {
      setSelectedPreset(profile.avatarSrc);
    }
  }, [isSetupFlow, router, searchParams]);

  const clearPhoto = useCallback(() => {
    setAvatarSrc(DEFAULT_PROFILE_AVATAR);
    setSelectedPreset(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      try {
        const dataUrl = await readFileAsDataUrl(file);
        setAvatarSrc(dataUrl);
        setSelectedPreset(null);
      } catch {
        // Keep the previous avatar if the file cannot be read.
      }
    },
    []
  );

  const handlePresetSelect = useCallback((src: string) => {
    setAvatarSrc(src);
    setSelectedPreset(src);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleDeletePhoto = useCallback(() => {
    clearPhoto();
  }, [clearPhoto]);

  const handleComplete = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      writeUserProfile({
        avatarSrc,
        fullName,
      });
      markProfileComplete();
      router.push("/");
    },
    [avatarSrc, fullName, router]
  );

  const handleCancel = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <main className="relative flex min-h-screen flex-col overflow-x-hidden bg-white">
      {isSetupFlow ? (
        <Link
          href="/"
          aria-label="InkMorph home"
          className="absolute left-4 top-5 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 tablet:left-8 tablet:top-8"
        >
          <InkMorphLogo size={42} radius={6} alt="" />
        </Link>
      ) : (
        <BackButton
          ariaLabel="Back"
          useHistoryBack
          fallbackHref="/"
          className="absolute left-4 top-5 z-10 tablet:left-8 tablet:top-8"
        />
      )}

      <section className="flex w-full flex-1 items-center justify-center px-4 py-16 tablet:px-8 tablet:py-20">
        <form
          className="mx-auto flex w-full min-w-0 max-w-[400px] flex-col gap-4"
          onSubmit={handleComplete}
        >
          <h1 className="sr-only">
            {isSetupFlow ? "Complete Your Profile" : "Edit Profile"}
          </h1>

          <div className="flex w-full min-w-0 flex-col gap-4">
            <div className="flex w-full min-w-0 flex-col items-center gap-6">
              <div
                className="relative shrink-0 overflow-hidden rounded-full bg-[#F5F5F5]"
                style={{
                  width: COMPLETE_PROFILE.avatarPreviewSize,
                  height: COMPLETE_PROFILE.avatarPreviewSize,
                }}
              >
                <Image
                  key={avatarSrc}
                  src={avatarSrc}
                  alt="Selected profile photo"
                  fill
                  sizes={`${COMPLETE_PROFILE.avatarPreviewSize}px`}
                  className="object-cover"
                  unoptimized={isCustomAvatarSrc(avatarSrc)}
                />
              </div>

              <div className="flex w-full min-w-0 flex-wrap items-center justify-center gap-3">
                <input
                  ref={fileInputRef}
                  id={fileInputId}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="inline-flex shrink-0 items-center justify-center rounded-full border border-solid bg-white px-[22px] py-2.5 font-inter text-base font-medium leading-7 text-black transition-colors hover:bg-gray-100/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2"
                  style={{
                    borderColor: COMPLETE_PROFILE.inputBorder,
                  }}
                >
                  Upload picture
                </button>
                <button
                  type="button"
                  onClick={handleDeletePhoto}
                  aria-label="Delete profile picture"
                  className="inline-flex shrink-0 items-center justify-center rounded-full px-[22px] py-2.5 font-inter text-base font-medium leading-7 text-black transition-colors hover:bg-[#F0F0F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2"
                  style={{
                    backgroundColor: COMPLETE_PROFILE.deleteButtonBg,
                  }}
                >
                  Delete
                </button>
              </div>

              <div
                className="flex w-full min-w-0 flex-wrap items-center justify-center gap-2 tablet:gap-4"
                role="listbox"
                aria-label="Choose a preset avatar"
              >
                {PROFILE_PRESETS.map((src) => {
                  const isSelected = selectedPreset === src;

                  return (
                    <button
                      key={src}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handlePresetSelect(src)}
                      className={[
                        "relative size-11 shrink-0 overflow-hidden rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#057AF0]/30 focus-visible:ring-offset-2 tablet:size-[52px]",
                        isSelected ? "ring-2 ring-[#057AF0] ring-offset-2" : "",
                      ].join(" ")}
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="(max-width: 767px) 44px, 52px"
                        className="object-cover"
                        aria-hidden
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="flex w-full min-w-0 flex-col gap-1.5">
              <span
                className="font-inter text-sm font-medium leading-[22px]"
                style={{ color: COMPLETE_PROFILE.labelColor }}
              >
                Full Name
              </span>
              <input
                type="text"
                name="fullName"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                autoComplete="name"
                className="w-full min-w-0 border border-solid bg-white px-3.5 py-2.5 font-inter text-base font-normal leading-7 outline-none focus-visible:ring-2 focus-visible:ring-[#057AF0]/25"
                style={{
                  borderColor: COMPLETE_PROFILE.inputBorder,
                  borderRadius: COMPLETE_PROFILE.inputRadius,
                  boxShadow: COMPLETE_PROFILE.inputShadow,
                  color: COMPLETE_PROFILE.labelColor,
                }}
              />
            </label>

            <label className="flex w-full min-w-0 flex-col gap-1.5">
              <span
                className="font-inter text-sm font-medium leading-[22px]"
                style={{ color: COMPLETE_PROFILE.labelColor }}
              >
                Email
              </span>
              <input
                type="email"
                name="email"
                value={email}
                readOnly
                autoComplete="email"
                className="w-full min-w-0 border border-solid bg-white px-3.5 py-2.5 font-inter text-base font-normal leading-7 opacity-50 outline-none"
                style={{
                  borderColor: COMPLETE_PROFILE.inputBorder,
                  borderRadius: COMPLETE_PROFILE.inputRadius,
                  boxShadow: COMPLETE_PROFILE.inputShadow,
                  color: COMPLETE_PROFILE.labelColor,
                }}
              />
            </label>
          </div>

          <button
            type="submit"
            className={[
              "relative inline-flex w-full min-w-0 items-center justify-center overflow-hidden border border-solid border-[#E4E4E4] px-4 py-2",
              "font-inter text-base font-medium leading-7 text-white",
              "shadow-[1px_1px_3px_rgba(78,78,80,0.24)] transition-opacity hover:opacity-90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2",
            ].join(" ")}
            style={{ borderRadius: COMPLETE_PROFILE.inputRadius }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                borderRadius: COMPLETE_PROFILE.inputRadius,
                backgroundImage:
                  "linear-gradient(180deg, rgba(255,255,255,0.4) 4.17%, rgba(99,99,99,0.4) 43.06%), linear-gradient(90deg, #000 0%, #000 100%)",
              }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_2px_2px_10px_0px_rgba(255,255,255,0.18)]"
            />
            <span className="relative">
              {isSetupFlow ? "Complete Setup" : "Save changes"}
            </span>
          </button>

          {!isSetupFlow ? (
            <button
              type="button"
              onClick={handleCancel}
              className="inline-flex w-full min-w-0 items-center justify-center border border-solid bg-white px-4 py-2 font-inter text-base font-medium leading-7 transition-colors hover:bg-gray-100/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2"
              style={{
                borderColor: COMPLETE_PROFILE.skipBorder,
                borderRadius: COMPLETE_PROFILE.inputRadius,
                color: COMPLETE_PROFILE.skipText,
              }}
            >
              Cancel
            </button>
          ) : null}
        </form>
      </section>
    </main>
  );
}
