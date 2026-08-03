export type ActionButtonVariant = "copy" | "download";

export type ActionButtonState = "default" | "hover" | "loading" | "success";

export type CardActionState =
  | "idle"
  | "copying"
  | "copied"
  | "downloading"
  | "downloaded";

export const ACTION_BUTTON_LABELS: Record<
  ActionButtonVariant,
  Record<ActionButtonState, string>
> = {
  copy: {
    default: "Copy Image",
    hover: "Copy Image",
    loading: "Copying...",
    success: "Copied",
  },
  download: {
    default: "Download PNG",
    hover: "Download PNG",
    loading: "Downloading...",
    success: "Downloaded",
  },
};

export function mapCardStateToActionButton(
  actionState: CardActionState
): { variant: ActionButtonVariant; state: ActionButtonState } | null {
  switch (actionState) {
    case "copying":
      return { variant: "copy", state: "loading" };
    case "copied":
      return { variant: "copy", state: "success" };
    case "downloading":
      return { variant: "download", state: "loading" };
    case "downloaded":
      return { variant: "download", state: "success" };
    default:
      return null;
  }
}

export function getCopyButtonState(
  actionState: CardActionState
): ActionButtonState {
  if (actionState === "copying") {
    return "loading";
  }

  if (actionState === "copied") {
    return "success";
  }

  return "default";
}

export function getDownloadButtonState(
  actionState: CardActionState
): ActionButtonState {
  if (actionState === "downloading") {
    return "loading";
  }

  if (actionState === "downloaded") {
    return "success";
  }

  return "default";
}
