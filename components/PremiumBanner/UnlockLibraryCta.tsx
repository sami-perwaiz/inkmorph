import { GoPremiumButton } from "@/components/GoPremiumButton/GoPremiumButton";

/** Mid-page unlock CTA — Figma 40004712:10293 */
export function UnlockLibraryCta() {
  return (
    <div className="flex w-full flex-col items-center gap-6 px-4">
      <p className="w-full min-w-full text-center font-poppins text-xl font-normal leading-6 text-[#797979]">
        Unlock the complete library
      </p>
      <GoPremiumButton />
    </div>
  );
}
