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
