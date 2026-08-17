import Image from "next/image";

/** Pro crown badge — scales with gallery grid tile size (Figma 40004700:9498). */
export function PremiumBadge() {
  return (
    <div
      className="pointer-events-none absolute bottom-2 left-2 z-20 flex size-5 items-center justify-center rounded-[4px] p-1 shadow-[0px_8px_8px_-4px_rgba(10,13,18,0.08),0px_20px_24px_-4px_rgba(10,13,18,0.14)] tablet:bottom-3 tablet:left-3 tablet:size-6 tablet:rounded-[5px] tablet:p-1.5 desktop:bottom-4 desktop:left-4 desktop:size-7 desktop:rounded-[6px] desktop:p-1.5"
      style={{
        backgroundImage:
          "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(99,99,99,0.2) 100%), linear-gradient(90deg, #000 0%, #000 100%)",
      }}
      aria-hidden
    >
      <span className="relative size-2.5 shrink-0 overflow-hidden tablet:size-3 desktop:size-4">
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
