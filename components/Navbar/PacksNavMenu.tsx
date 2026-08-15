"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { getNavTabClassName, getNavTabStyle } from "@/lib/navTokens";

const PACKS_MENU_ITEMS = [
  { href: "/packs", label: "Icon Packs" },
  { href: "/wallpapers", label: "iPhone Wallpapers" },
] as const;

function isPacksRoute(pathname: string): boolean {
  return pathname === "/packs" || pathname === "/wallpapers";
}

/** Figma 40004968:9165 + 40004976:9603 — Packs nav tab with dropdown. */
export function PacksNavMenu({
  layout = "inline",
  onNavigate,
}: {
  layout?: "inline" | "stacked";
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const isStacked = layout === "stacked";
  const isActive = isPacksRoute(pathname);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (isActive) {
      setExpanded(true);
    }
  }, [isActive]);

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

  if (isStacked) {
    return (
      <div className="flex w-full flex-col items-stretch">
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
          className={getNavTabClassName({ active: isActive, layout: "stacked" })}
          style={getNavTabStyle()}
        >
          <span className="flex w-full items-center justify-between">
            <span>Packs</span>
            <Image
              src="/icons/chevron-down.svg"
              alt=""
              width={16}
              height={16}
              className={[
                "size-4 shrink-0 transition-transform duration-200",
                expanded ? "rotate-180" : "",
              ].join(" ")}
              aria-hidden
            />
          </span>
        </button>

        {expanded ? (
          <div className="mt-2 flex w-full flex-col gap-1 border border-solid border-[#EAEAEA] bg-white p-2">
            {PACKS_MENU_ITEMS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                onClick={onNavigate}
                className={[
                  "rounded-md px-2 py-2 font-poppins text-sm font-normal leading-5 text-black outline-none transition-colors",
                  "hover:bg-[#F5F5F5] focus-visible:bg-[#F5F5F5] focus-visible:ring-2 focus-visible:ring-gray-900/30",
                  pathname === href ? "bg-[#F5F5F5]" : "",
                ].join(" ")}
              >
                {label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={handleTriggerKeyDown}
        className={[
          getNavTabClassName({ active: isActive || open }),
          "gap-2.5",
        ].join(" ")}
        style={getNavTabStyle()}
      >
        Packs
        <Image
          src="/icons/chevron-down.svg"
          alt=""
          width={16}
          height={16}
          className={[
            "size-4 shrink-0 transition-transform duration-200",
            open ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Packs"
          className="absolute left-0 top-[calc(100%+8px)] z-50 flex w-[195px] flex-col gap-2 rounded-lg border border-solid border-[#EAEAEA] bg-white p-2 shadow-sm"
        >
          {PACKS_MENU_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              role="menuitem"
              aria-current={pathname === href ? "page" : undefined}
              onClick={() => {
                close();
                onNavigate?.();
              }}
              className={[
                "rounded-md px-2 py-2 font-poppins text-sm font-normal leading-5 text-black outline-none transition-colors",
                "hover:bg-[#F5F5F5] focus-visible:bg-[#F5F5F5] focus-visible:ring-2 focus-visible:ring-gray-900/30",
                pathname === href ? "bg-[#F5F5F5]" : "",
              ].join(" ")}
            >
              {label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
