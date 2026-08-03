"use client";

import {
  ActionButton,
  type ActionButtonState,
} from "@/components/ActionButton/ActionButton";

interface DownloadButtonProps {
  state?: ActionButtonState;
  onClick?: () => void;
  disabled?: boolean;
}

export function DownloadButton({
  state = "default",
  onClick,
  disabled,
}: DownloadButtonProps) {
  return (
    <ActionButton
      variant="download"
      state={state}
      onClick={onClick}
      disabled={disabled}
    />
  );
}
