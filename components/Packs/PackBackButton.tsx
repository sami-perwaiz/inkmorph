import Image from "next/image";
import Link from "next/link";

interface PackBackButtonProps {
  ariaLabel: string;
  className?: string;
  href?: string;
  onClose?: () => void;
}

const packNavButtonClassName = [
  "inline-flex size-[44px] shrink-0 items-center justify-center rounded-[6px] border border-solid border-[#EAEAEA] bg-white",
  "transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2",
].join(" ");

/** Figma 40004968:9305 — back or close control for pack detail toolbar. */
export function PackBackButton({
  ariaLabel,
  className = "",
  href,
  onClose,
}: PackBackButtonProps) {
  const iconSrc = onClose ? "/icons/close.svg" : "/icons/arrow-left.svg";

  if (onClose) {
    return (
      <button
        type="button"
        onClick={onClose}
        aria-label={ariaLabel}
        className={[packNavButtonClassName, className].join(" ")}
      >
        <Image
          src={iconSrc}
          alt=""
          width={24}
          height={24}
          className="size-6 shrink-0"
          aria-hidden
        />
      </button>
    );
  }

  return (
    <Link
      href={href ?? "/packs"}
      aria-label={ariaLabel}
      className={[packNavButtonClassName, className].join(" ")}
    >
      <Image
        src={iconSrc}
        alt=""
        width={24}
        height={24}
        className="size-6 shrink-0"
        aria-hidden
      />
    </Link>
  );
}
