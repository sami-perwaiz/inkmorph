"use client";

import { memo } from "react";

import { ActionButton } from "@/components/ActionButton/ActionButton";
import { ACTION } from "@/lib/constants";
import {
  getCopyButtonState,
  getDownloadButtonState,
  type CardActionState,
} from "@/types/action";

interface ActionOverlayProps {
  actionState: CardActionState;
  failedAction?: "copy" | "download" | null;
  visible: boolean;
  statusMessage?: string;
  onCopy: () => void;
  onDownload: () => void;
}

function OverlayScrim() {
  return (
    <div
      className="motion-overlay-scrim absolute inset-0 box-border rounded-2xl border border-solid border-gray-100"
      style={{ backgroundColor: "hsla(0, 0%, 0%, 0.01)" }}
      aria-hidden
    />
  );
}

function ActionOverlayComponent({
  actionState,
  failedAction = null,
  visible,
  statusMessage = "",
  onCopy,
  onDownload,
}: ActionOverlayProps) {
  return (
    <div
      className="motion-overlay-root absolute inset-0 z-10 rounded-2xl"
      data-visible={visible ? "true" : "false"}
    >
      <OverlayScrim />

      <div
        className="motion-overlay-panel absolute inset-0 flex flex-col items-center justify-center"
        style={{ gap: ACTION.buttonGap }}
      >
        <ActionButton
          variant="copy"
          state={getCopyButtonState(actionState, failedAction)}
          onClick={onCopy}
          className="motion-overlay-button"
        />
        <ActionButton
          variant="download"
          state={getDownloadButtonState(actionState, failedAction)}
          onClick={onDownload}
          className="motion-overlay-button"
        />
      </div>

      <span className="sr-only" aria-live="polite">
        {statusMessage}
      </span>
    </div>
  );
}

export const ActionOverlay = memo(ActionOverlayComponent);
