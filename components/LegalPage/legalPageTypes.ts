export interface LegalSection {
  title: string;
  paragraphs: readonly string[];
  list?: readonly string[];
  secondaryHeading?: string;
  secondaryList?: readonly string[];
  trailingParagraphs?: readonly string[];
  /** Show the contact email row after section content. */
  contactEmail?: boolean;
}

export type LegalPagePath = "/license" | "/privacy" | "/terms";
