import { BackButton } from "@/components/BackButton/BackButton";

interface PackBackButtonProps {
  ariaLabel: string;
  className?: string;
  href?: string;
  onClose?: () => void;
}

/** Back or close control for pack and wallpaper toolbars. */
export function PackBackButton({
  ariaLabel,
  className = "",
  href,
  onClose,
}: PackBackButtonProps) {
  if (onClose) {
    return (
      <BackButton
        ariaLabel={ariaLabel}
        className={className}
        variant="close"
        onClick={onClose}
      />
    );
  }

  return (
    <BackButton
      ariaLabel={ariaLabel}
      className={className}
      href={href ?? "/packs"}
    />
  );
}
