"use client";

import Image from "next/image";

interface DownloadWallpaperButtonProps {
  onClick: () => void;
  className?: string;
}

/** Figma 40004968:9107 — Download Wallpaper CTA. */
export function DownloadWallpaperButton({
  onClick,
  className = "",
}: DownloadWallpaperButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-[6px] border border-solid border-[#E4E4E4] px-[18px] py-[14px]",
        "font-poppins text-sm font-normal leading-4 tracking-[-0.14px] text-white",
        "shadow-[1px_1px_3px_rgba(78,78,80,0.24)] transition-opacity hover:opacity-90",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2",
        className,
      ].join(" ")}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[6px]"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(255,255,255,0.4) 4.17%, rgba(99,99,99,0.4) 43.06%), linear-gradient(90deg, #000 0%, #000 100%)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_2px_2px_10px_0px_rgba(255,255,255,0.18)]"
      />
      <span className="relative">Download Wallpaper</span>
      <span className="relative size-4 shrink-0">
        <Image
          src="/icons/download.svg"
          alt=""
          width={16}
          height={16}
          className="size-full brightness-0 invert"
          aria-hidden
        />
      </span>
    </button>
  );
}
