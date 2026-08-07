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
  /** Pro-only asset — shows crown badge and locked hover actions. */
  premium?: boolean;
}
