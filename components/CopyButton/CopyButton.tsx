"use client";

import {
  ActionButton,
  type ActionButtonState,
} from "@/components/ActionButton/ActionButton";

interface CopyButtonProps {
  state?: ActionButtonState;
  onClick?: () => void;
  disabled?: boolean;
}

export function CopyButton({
  state = "default",
  onClick,
  disabled,
}: CopyButtonProps) {
  return (
    <ActionButton
      variant="copy"
      state={state}
      onClick={onClick}
      disabled={disabled}
    />
  );
}
