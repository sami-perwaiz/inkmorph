import type { SVGProps } from "react";

import { ACTION } from "@/lib/constants";

type IconProps = SVGProps<SVGSVGElement>;

const baseProps = {
  width: ACTION.iconSize,
  height: ACTION.iconSize,
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": true as const,
  focusable: "false" as const,
};

export function CopyIcon(props: IconProps) {
  return (
    <svg {...baseProps} viewBox="0 0 20 20" {...props}>
      <path
        d="M13.5 5.5V3.5C13.5 2.96957 13.2893 2.46086 12.9142 2.08579C12.5391 1.71071 12.0304 1.5 11.5 1.5H3.5C2.96957 1.5 2.46086 1.71071 2.08579 2.08579C1.71071 2.46086 1.5 2.96957 1.5 3.5V11.5C1.5 12.0304 1.71071 12.5391 2.08579 12.9142C2.46086 13.2893 2.96957 13.5 3.5 13.5H5.5M5.5 7.5C5.5 6.96957 5.71071 6.46086 6.08579 6.08579C6.46086 5.71071 6.96957 5.5 7.5 5.5H15.5C16.0304 5.5 16.5391 5.71071 16.9142 6.08579C17.2893 6.46086 17.5 6.96957 17.5 7.5V15.5C17.5 16.0304 17.2893 16.5391 16.9142 16.9142C16.5391 17.2893 16.0304 17.5 15.5 17.5H7.5C6.96957 17.5 6.46086 17.2893 6.08579 16.9142C5.71071 16.5391 5.5 16.0304 5.5 15.5V7.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg {...baseProps} viewBox="0 0 20 20" {...props}>
      <path
        d="M2.5 13.5V15.5C2.5 16.0304 2.71071 16.5391 3.08579 16.9142C3.46086 17.2893 3.96957 17.5 4.5 17.5H15.5C16.0304 17.5 16.5391 17.2893 16.9142 16.9142C17.2893 16.5391 17.5 16.0304 17.5 15.5V13.5M14.5 8.5L10 13L5.5 8.5M10 13V2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...baseProps} viewBox="0 0 20 20" {...props}>
      <path
        d="M3.5 10.25L7.75 14.5L16.5 5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SpinnerIcon(props: IconProps) {
  return (
    <svg
      width={ACTION.spinnerSize}
      height={ACTION.spinnerSize}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-spin"
      aria-hidden
      focusable="false"
      {...props}
    >
      <circle
        cx="10"
        cy="10"
        r="7"
        stroke="#88888C"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="28 44"
      />
    </svg>
  );
}

/** Figma lock — node inset in 20×20 icon box. */
export function LockIcon(props: IconProps) {
  return (
    <svg {...baseProps} viewBox="0 0 20 20" {...props}>
      <g transform="translate(3.6667 2)">
        <path
          d="M3 7.16667V3.83333C3 2.94928 3.35119 2.10143 3.97631 1.47631C4.60143 0.851189 5.44928 0.5 6.33333 0.5C7.21739 0.5 8.06524 0.851189 8.69036 1.47631C9.31548 2.10143 9.66667 2.94928 9.66667 3.83333V7.16667M0.5 8.83333C0.5 8.39131 0.675595 7.96738 0.988155 7.65482C1.30072 7.34226 1.72464 7.16667 2.16667 7.16667H10.5C10.942 7.16667 11.366 7.34226 11.6785 7.65482C11.9911 7.96738 12.1667 8.39131 12.1667 8.83333V13.8333C12.1667 14.2754 11.9911 14.6993 11.6785 15.0118C11.366 15.3244 10.942 15.5 10.5 15.5H2.16667C1.72464 15.5 1.30072 15.3244 0.988155 15.0118C0.675595 14.6993 0.5 14.2754 0.5 13.8333V8.83333ZM5.5 11.3333C5.5 11.5543 5.5878 11.7663 5.74408 11.9226C5.90036 12.0789 6.11232 12.1667 6.33333 12.1667C6.55435 12.1667 6.76631 12.0789 6.92259 11.9226C7.07887 11.7663 7.16667 11.5543 7.16667 11.3333C7.16667 11.1123 7.07887 10.9004 6.92259 10.7441C6.76631 10.5878 6.55435 10.5 6.33333 10.5C6.11232 10.5 5.90036 10.5878 5.74408 10.7441C5.5878 10.9004 5.5 11.1123 5.5 11.3333Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...baseProps} viewBox="0 0 20 20" {...props}>
      <path
        d="M5 7.5 10 12.5 15 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Gold outline crown for 2x dropdown item — Figma 40004706:9928 */
export function CrownGoldIcon(props: IconProps) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable="false"
      {...props}
    >
      <path
        d="M7.00002 3.1L9.33335 6.6L12.25 4.26667L11.0834 10.1H2.91669L1.75002 4.26667L4.66669 6.6L7.00002 3.1Z"
        stroke="#F5C400"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
