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

import { InkMorphLogo } from "@/components/InkMorphLogo/InkMorphLogo";
import {
  COMPLETE_PROFILE,
  PROFILE_PRESETS,
} from "@/lib/completeProfileTokens";
import {
  DEFAULT_PROFILE_AVATAR,
  DEFAULT_PROFILE_NAME,
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

  const [fullName, setFullName] = useState(DEFAULT_PROFILE_NAME);
  const [avatarSrc, setAvatarSrc] = useState(DEFAULT_PROFILE_AVATAR);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  useEffect(() => {
    const profile = readUserProfile();
    setFullName(profile.fullName);
    setAvatarSrc(profile.avatarSrc);

    if (
      PROFILE_PRESETS.includes(
        profile.avatarSrc as (typeof PROFILE_PRESETS)[number]
      )
    ) {
      setSelectedPreset(profile.avatarSrc);
    }
  }, []);

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
      router.push("/");
    },
    [avatarSrc, fullName, router]
  );

  const handleCancel = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <main className="relative flex min-h-screen flex-col bg-white">
      {isSetupFlow ? (
        <Link
          href="/"
          aria-label="InkMorph home"
          className="absolute left-5 top-5 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 tablet:left-8 tablet:top-8"
        >
          <InkMorphLogo size={42} radius={6} alt="" />
        </Link>
      ) : (
        <Link
          href="/"
          aria-label="Back to home"
          className="absolute left-5 top-5 z-10 inline-flex size-6 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 tablet:left-8 tablet:top-8"
        >
          <Image
            src="/icons/arrow-left.svg"
            alt=""
            width={16}
            height={14}
            className="size-4"
            aria-hidden
          />
        </Link>
      )}

      <section className="flex w-full flex-1 items-center justify-center px-5 py-20 tablet:px-8">
        <form
          className="flex w-full flex-col"
          style={{
            maxWidth: COMPLETE_PROFILE.formWidth,
            gap: COMPLETE_PROFILE.stackGap,
          }}
          onSubmit={handleComplete}
        >
          <h1 className="sr-only">
            {isSetupFlow ? "Complete Your Profile" : "Edit Profile"}
          </h1>

          <div
            className="flex w-full flex-col"
            style={{ gap: COMPLETE_PROFILE.stackGap }}
          >
            <div
              className="flex w-full flex-col items-center justify-center"
              style={{ gap: COMPLETE_PROFILE.photoStackGap }}
            >
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

              <div
                className="flex items-center"
                style={{ gap: COMPLETE_PROFILE.stackGap }}
              >
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
                  className="inline-flex items-center justify-center border border-solid bg-white px-[22px] py-2.5 font-inter text-base font-medium leading-7 text-black transition-colors hover:bg-gray-100/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2"
                  style={{
                    borderColor: COMPLETE_PROFILE.inputBorder,
                    borderRadius: 999,
                  }}
                >
                  Upload picture
                </button>
                <button
                  type="button"
                  onClick={handleDeletePhoto}
                  aria-label="Delete profile picture"
                  className="inline-flex items-center justify-center px-[22px] py-2.5 font-inter text-base font-medium leading-7 text-black transition-colors hover:bg-[#F0F0F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2"
                  style={{
                    backgroundColor: COMPLETE_PROFILE.deleteButtonBg,
                    borderRadius: 999,
                  }}
                >
                  Delete
                </button>
              </div>

              <div
                className="flex w-full items-center justify-center"
                style={{ gap: COMPLETE_PROFILE.presetGap }}
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
                        "relative shrink-0 overflow-hidden rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#057AF0]/30 focus-visible:ring-offset-2",
                        isSelected ? "ring-2 ring-[#057AF0] ring-offset-2" : "",
                      ].join(" ")}
                      style={{
                        width: COMPLETE_PROFILE.presetSize,
                        height: COMPLETE_PROFILE.presetSize,
                      }}
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes={`${COMPLETE_PROFILE.presetSize}px`}
                        className="object-cover"
                        aria-hidden
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex w-full flex-col" style={{ gap: 4 }}>
              <label
                className="flex w-full flex-col"
                style={{ gap: COMPLETE_PROFILE.fieldGap }}
              >
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
                  className="w-full border border-solid bg-white px-3.5 py-2.5 font-inter text-base font-normal leading-7 outline-none focus-visible:ring-2 focus-visible:ring-[#057AF0]/25"
                  style={{
                    borderColor: COMPLETE_PROFILE.inputBorder,
                    borderRadius: COMPLETE_PROFILE.inputRadius,
                    boxShadow: COMPLETE_PROFILE.inputShadow,
                    color: COMPLETE_PROFILE.labelColor,
                  }}
                />
              </label>
            </div>

            <div className="flex w-full flex-col" style={{ gap: 4 }}>
              <label
                className="flex w-full flex-col"
                style={{ gap: COMPLETE_PROFILE.fieldGap }}
              >
                <span
                  className="font-inter text-sm font-medium leading-[22px]"
                  style={{ color: COMPLETE_PROFILE.labelColor }}
                >
                  Email
                </span>
                <input
                  type="email"
                  name="email"
                  value="samiperwaiz@gmail.com"
                  readOnly
                  autoComplete="email"
                  className="w-full border border-solid bg-white px-3.5 py-2.5 font-inter text-base font-normal leading-7 opacity-50 outline-none"
                  style={{
                    borderColor: COMPLETE_PROFILE.inputBorder,
                    borderRadius: COMPLETE_PROFILE.inputRadius,
                    boxShadow: COMPLETE_PROFILE.inputShadow,
                    color: COMPLETE_PROFILE.labelColor,
                  }}
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            className={[
              "relative inline-flex w-full items-center justify-center overflow-hidden border border-solid border-[#E4E4E4] px-4 py-2",
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
              className="inline-flex w-full items-center justify-center border border-solid bg-white px-4 py-2 font-inter text-base font-medium leading-7 transition-colors hover:bg-gray-100/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2"
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
