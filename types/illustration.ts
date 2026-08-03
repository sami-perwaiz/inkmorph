export type IllustrationCategory = "3d-avatar" | "black-white";

export type FilterValue = "all" | IllustrationCategory;

export interface Illustration {
  /** Permanent InkMorph Asset ID, e.g. IM3D-KPX-001 */
  id: string;
  category: IllustrationCategory;
  src: string;
  /** Public illustrations filename, e.g. 001-image-2.png */
  filename: string;
  alt: string;
}
