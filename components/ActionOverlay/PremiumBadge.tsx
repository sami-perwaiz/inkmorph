import Image from "next/image";

import { ACTION } from "@/lib/constants";

/** Pro crown badge — Figma 40004700:9498 (always visible on premium cards). */
export function PremiumBadge() {
  return (
    <div
      className="pointer-events-none absolute z-20 flex items-center justify-center shadow-[0px_8px_8px_-4px_rgba(10,13,18,0.08),0px_20px_24px_-4px_rgba(10,13,18,0.14)]"
      style={{
        left: ACTION.compactInset,
        bottom: ACTION.compactInset,
        width: ACTION.premiumBadgeSize,
        height: ACTION.premiumBadgeSize,
        padding: ACTION.premiumBadgePad,
        borderRadius: ACTION.premiumBadgeRadius,
        backgroundImage:
          "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(99,99,99,0.2) 100%), linear-gradient(90deg, #000 0%, #000 100%)",
      }}
      aria-hidden
    >
      <span
        className="relative shrink-0 overflow-hidden"
        style={{
          width: ACTION.premiumCrownSize,
          height: ACTION.premiumCrownSize,
        }}
      >
        <Image
          src="/icons/crown.png"
          alt=""
          width={24}
          height={24}
          className="absolute left-[-22%] top-[-22%] size-[144%] max-w-none"
        />
      </span>
    </div>
  );
}
