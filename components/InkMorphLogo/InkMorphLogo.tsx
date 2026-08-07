interface InkMorphLogoProps {
  size: number;
  radius?: number;
  className?: string;
  alt?: string;
}

/**
 * Crisp vector InkMorph mark — traced from Figma 40004712:10265.
 * Prefer this over the raster /logo.png for UI chrome.
 */
export function InkMorphLogo({
  size,
  radius = 6,
  className = "",
  alt = "InkMorph",
}: InkMorphLogoProps) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden ${className}`.trim()}
      style={{ width: size, height: size, borderRadius: radius }}
      role="img"
      aria-label={alt}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 168 168"
        width={size}
        height={size}
        className="absolute inset-0 size-full"
        aria-hidden
      >
        <rect width="168" height="168" fill="#FFFFFF" />
        <rect x="31" y="31" width="53" height="106" fill="#000000" />
        <rect x="84" y="84" width="26" height="53" fill="#000000" />
        <rect x="97" y="31" width="40" height="26" fill="#000000" />
        <rect x="115" y="57" width="22" height="23" fill="#000000" />
        <rect x="120" y="93" width="17" height="17" fill="#000000" />
      </svg>
    </div>
  );
}
