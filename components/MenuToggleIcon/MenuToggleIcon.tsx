interface MenuToggleIconProps {
  open: boolean;
}

const STROKE = {
  color: "black",
  width: 2,
  linecap: "round" as const,
  linejoin: "round" as const,
};

/** Figma menu.svg (closed) + close.svg (open) — exact paths, morph + crossfade. */
export function MenuToggleIcon({ open }: MenuToggleIconProps) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      overflow="visible"
      xmlns="http://www.w3.org/2000/svg"
      className="motion-menu-toggle block shrink-0"
      data-open={open ? "true" : "false"}
      aria-hidden
    >
      <g className="motion-menu-toggle-hamburger">
        <path
          d="M4 8H20"
          stroke={STROKE.color}
          strokeWidth={STROKE.width}
          strokeLinecap={STROKE.linecap}
          strokeLinejoin={STROKE.linejoin}
          className="motion-menu-toggle-line motion-menu-toggle-line-top"
        />
        <path
          d="M4 16H20"
          stroke={STROKE.color}
          strokeWidth={STROKE.width}
          strokeLinecap={STROKE.linecap}
          strokeLinejoin={STROKE.linejoin}
          className="motion-menu-toggle-line motion-menu-toggle-line-bottom"
        />
      </g>

      <g className="motion-menu-toggle-close">
        <path
          d="M6.34315 6.34315L17.6569 17.6569"
          stroke={STROKE.color}
          strokeWidth={STROKE.width}
          strokeLinecap={STROKE.linecap}
          strokeLinejoin={STROKE.linejoin}
        />
        <path
          d="M6.34315 17.6569L17.6569 6.34315"
          stroke={STROKE.color}
          strokeWidth={STROKE.width}
          strokeLinecap={STROKE.linecap}
          strokeLinejoin={STROKE.linejoin}
        />
      </g>
    </svg>
  );
}
