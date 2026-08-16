"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useState,
  type KeyboardEvent,
} from "react";

import { AnimatedDropdownPanel } from "@/components/AnimatedDropdownPanel/AnimatedDropdownPanel";
import { useNavDropdown } from "@/components/Navbar/NavDropdownContext";
import {
  AUTH_CHANGE_EVENT,
  isSignedIn,
  signOut,
} from "@/lib/authSession";
import {
  getMenuDropdownItemClassName,
  getMenuDropdownPanelClassName,
} from "@/lib/navTokens";
import {
  DEFAULT_PROFILE_AVATAR,
  isCustomAvatarSrc,
  PROFILE_CHANGE_EVENT,
  readUserProfile,
} from "@/lib/userProfile";

/** Figma 40004824:12270 — profile avatar + dropdown (signed-in only). */
export function ProfileMenu() {
  const [signedIn, setSignedInState] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(DEFAULT_PROFILE_AVATAR);
  const menuId = useId();
  const { activeDropdown, toggleDropdown, setActiveDropdown } = useNavDropdown();
  const open = activeDropdown === "profile";

  useEffect(() => {
    const syncAuth = () => {
      const next = isSignedIn();
      setSignedInState(next);
      if (!next) {
        setActiveDropdown(null);
      }
    };

    syncAuth();
    window.addEventListener(AUTH_CHANGE_EVENT, syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, [setActiveDropdown]);

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

  const close = useCallback(
    () => setActiveDropdown(null),
    [setActiveDropdown]
  );

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setActiveDropdown("profile");
    }
  };

  if (!signedIn) {
    return null;
  }

  return (
    <div className="relative flex flex-col items-end">
      <button
        type="button"
        aria-label="Open profile menu"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => toggleDropdown("profile")}
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

      <AnimatedDropdownPanel
        open={open}
        id={menuId}
        label="Profile"
        connected
        className={getMenuDropdownPanelClassName({ align: "right" })}
      >
        <Link
          href="/complete-profile"
          role="menuitem"
          onClick={close}
          className={getMenuDropdownItemClassName({ active: false })}
        >
          Edit profile
        </Link>
        <Link
          href="/privacy"
          role="menuitem"
          onClick={close}
          className={getMenuDropdownItemClassName({ active: false })}
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
          className={getMenuDropdownItemClassName({
            active: false,
            destructive: true,
          })}
        >
          Logout
        </Link>
      </AnimatedDropdownPanel>
    </div>
  );
}
