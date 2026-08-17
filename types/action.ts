export type ActionButtonVariant = "copy" | "download";

export type ActionButtonState =
  | "default"
  | "hover"
  | "loading"
  | "success"
  | "error";

export type CardActionState =
  | "idle"
  | "copying"
  | "copied"
  | "downloading"
  | "downloaded"
  | "error";

export const ACTION_BUTTON_LABELS: Record<
  ActionButtonVariant,
  Record<ActionButtonState, string>
> = {
  copy: {
    default: "Copy Image",
    hover: "Copy Image",
    loading: "Copying...",
    success: "Copied",
    error: "Copy failed",
  },
  download: {
    default: "Download PNG",
    hover: "Download PNG",
    loading: "Downloading...",
    success: "Downloaded",
    error: "Download failed",
  },
};

export function getCopyButtonState(
  actionState: CardActionState,
  failedAction: "copy" | "download" | null = null
): ActionButtonState {
  if (actionState === "copying") {
    return "loading";
  }

  if (actionState === "copied") {
    return "success";
  }

  if (actionState === "error" && failedAction === "copy") {
    return "error";
  }

  return "default";
}

export function getDownloadButtonState(
  actionState: CardActionState,
  failedAction: "copy" | "download" | null = null
): ActionButtonState {
  if (actionState === "downloading") {
    return "loading";
  }

  if (actionState === "downloaded") {
    return "success";
  }

  if (actionState === "error" && failedAction === "download") {
    return "error";
  }

  return "default";
}

export function getCopyButtonLabel(
  actionState: CardActionState,
  failedAction: "copy" | "download" | null,
  statusMessage = ""
): string {
  const state = getCopyButtonState(actionState, failedAction);

  if (state === "loading") {
    return statusMessage || ACTION_BUTTON_LABELS.copy.loading;
  }

  if (state === "success") {
    return "Copied";
  }

  if (state === "error") {
    return statusMessage || "Copy failed · Try again";
  }

  return ACTION_BUTTON_LABELS.copy.default;
}

export function getDownloadButtonLabel(
  actionState: CardActionState,
  failedAction: "copy" | "download" | null,
  statusMessage = ""
): string {
  const state = getDownloadButtonState(actionState, failedAction);

  if (state === "loading") {
    return statusMessage || ACTION_BUTTON_LABELS.download.loading;
  }

  if (state === "success") {
    return "Downloaded";
  }

  if (state === "error") {
    return statusMessage || "Download failed · Try again";
  }

  return ACTION_BUTTON_LABELS.download.default;
}
