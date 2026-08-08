export type IllustrationCategory = "3d-icon";

/** Homepage category tabs (Figma 40004600:8136). */
export type FilterValue =
  | "all"
  | "avatar"
  | "character"
  | "object"
  | "abstract";

export interface Illustration {
  /** Permanent InkMorph Asset ID, e.g. IM3D-KPX-001 */
  id: string;
  category: IllustrationCategory;
  src: string;
  /** Public illustrations filename, e.g. 001-icon01.png */
  filename: string;
  alt: string;
  /** Pro-locked asset — crown badge and locked copy/download. */
  premium?: boolean;
  /**
   * Hidden behind the free-plan fade (peek row only).
   * Premium-locked free-plan items are `premium` but not `paywalled`.
   */
  paywalled?: boolean;
  /** Searchable display name (gallery cards hide this; preview may use it). */
  name?: string;
  /** Search keywords; preview popup shows up to 4 as `#tags`. */
  tags?: string[];
}
