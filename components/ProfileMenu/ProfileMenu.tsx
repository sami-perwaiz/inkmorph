"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import {
  AUTH_CHANGE_EVENT,
  isSignedIn,
  signOut,
} from "@/lib/authSession";
import {
  DEFAULT_PROFILE_AVATAR,
  isCustomAvatarSrc,
  PROFILE_CHANGE_EVENT,
  readUserProfile,
} from "@/lib/userProfile";

/** Figma 40004824:12270 — profile avatar + dropdown (signed-in only). */
export function ProfileMenu() {
  const [signedIn, setSignedInState] = useState(false);
  const [open, setOpen] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(DEFAULT_PROFILE_AVATAR);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const syncAuth = () => {
      const next = isSignedIn();
      setSignedInState(next);
      if (!next) {
        setOpen(false);
      }
    };

    syncAuth();
    window.addEventListener(AUTH_CHANGE_EVENT, syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  useEffect(() => {
    if (!signedIn) {
      return;
    }

    const syncAvatar = () => {
      setAvatarSrc(readUserProfile().avatarSrc);
    };

    syncAvatar();
    window.addEventListener(PROFILE_CHANGE_EVENT, syncAvatar);
    window.addEventListener("storage", syncAvatar);

    return () => {
      window.removeEventListener(PROFILE_CHANGE_EVENT, syncAvatar);
      window.removeEventListener("storage", syncAvatar);
    };
  }, [signedIn]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (target && rootRef.current?.contains(target)) {
        return;
      }
      close();
    };

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, close]);

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  };

  if (!signedIn) {
    return null;
  }

  return (
    <div ref={rootRef} className="relative flex flex-col items-end gap-3">
      <button
        type="button"
        aria-label="Open profile menu"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={handleTriggerKeyDown}
        className="relative size-11 shrink-0 overflow-hidden rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2"
      >
        <Image
          key={avatarSrc}
          src={avatarSrc}
          alt=""
          width={44}
          height={44}
          className="size-full object-cover"
          unoptimized={isCustomAvatarSrc(avatarSrc)}
        />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Profile"
          className="absolute top-[calc(100%+12px)] right-0 z-[60] flex min-w-[168px] flex-col gap-3 rounded-lg border border-solid border-[#F5F5F5] bg-white p-2 shadow-[2px_4px_8px_rgba(10,13,18,0.06)]"
        >
          <Link
            href="/complete-profile"
            role="menuitem"
            onClick={close}
            className="flex w-full items-center rounded-md px-1.5 py-1 font-poppins text-base font-normal leading-5 text-black outline-none hover:bg-[#F5F5F5] focus-visible:bg-[#F5F5F5]"
          >
            Edit profile
          </Link>
          <Link
            href="/privacy"
            role="menuitem"
            onClick={close}
            className="flex w-full items-center rounded-md px-1.5 py-1 font-poppins text-base font-normal leading-5 text-black outline-none hover:bg-[#F5F5F5] focus-visible:bg-[#F5F5F5]"
          >
            Privacy Policy
          </Link>
          <Link
            href="/signin"
            role="menuitem"
            onClick={() => {
              signOut();
              close();
            }}
            className="flex w-full items-center rounded-md px-1.5 py-1 font-poppins text-base font-normal leading-5 text-[#F04438] outline-none hover:bg-[#F5F5F5] focus-visible:bg-[#F5F5F5]"
          >
            Logout
          </Link>
        </div>
      ) : null}
    </div>
  );
}
