"use client";

import Image from "next/image";
import Link from "next/link";
import { useHistoryBack } from "@/hooks/useHistoryBack";

export const backButtonClassName = [
  "inline-flex size-[44px] shrink-0 items-center justify-center rounded-[6px] border border-solid border-[#EAEAEA] bg-white",
  "transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2",
].join(" ");

interface BackButtonIconProps {
  variant: "back" | "close";
}

function BackButtonIcon({ variant }: BackButtonIconProps) {
  const iconSrc = variant === "close" ? "/icons/close.svg" : "/icons/arrow-left.svg";

  return (
    <Image
      src={iconSrc}
      alt=""
      width={24}
      height={24}
      className="size-6 shrink-0"
      aria-hidden
    />
  );
}

interface BackButtonLinkProps {
  ariaLabel: string;
  className?: string;
  href: string;
  variant?: "back" | "close";
  fallbackHref?: never;
  onClick?: never;
  useHistoryBack?: never;
}

interface BackButtonHistoryProps {
  ariaLabel: string;
  className?: string;
  href?: never;
  variant?: "back" | "close";
  fallbackHref?: string;
  onClick?: never;
  useHistoryBack: true;
}

interface BackButtonClickProps {
  ariaLabel: string;
  className?: string;
  href?: never;
  variant?: "back" | "close";
  fallbackHref?: never;
  onClick: () => void;
  useHistoryBack?: never;
}

export type BackButtonProps =
  | BackButtonLinkProps
  | BackButtonHistoryProps
  | BackButtonClickProps;

export function BackButton(props: BackButtonProps) {
  const variant = props.variant ?? "back";
  const className = [backButtonClassName, props.className].filter(Boolean).join(" ");

  const fallbackHref =
    "fallbackHref" in props ? props.fallbackHref : undefined;

  const handleHistoryBack = useHistoryBack({ fallbackHref });

  if (props.useHistoryBack) {
    return (
      <button
        type="button"
        onClick={handleHistoryBack}
        aria-label={props.ariaLabel}
        className={className}
      >
        <BackButtonIcon variant={variant} />
      </button>
    );
  }

  if (props.onClick) {
    return (
      <button
        type="button"
        onClick={props.onClick}
        aria-label={props.ariaLabel}
        className={className}
      >
        <BackButtonIcon variant={variant} />
      </button>
    );
  }

  return (
    <Link href={props.href} aria-label={props.ariaLabel} className={className}>
      <BackButtonIcon variant={variant} />
    </Link>
  );
}
