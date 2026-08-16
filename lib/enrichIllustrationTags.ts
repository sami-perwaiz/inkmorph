/** Gallery content category derived from public filename (matches filterIllustrations). */
export type IllustrationContentCategory =
  | "avatar"
  | "character"
  | "object"
  | "abstract";

export function getIllustrationContentCategory(
  filename: string
): IllustrationContentCategory {
  if (/abstract/i.test(filename)) {
    return "abstract";
  }

  if (/character/i.test(filename)) {
    return "character";
  }

  if (/avatar/i.test(filename)) {
    return "avatar";
  }

  return "object";
}

const CATEGORY_TAGS: Record<IllustrationContentCategory, string[]> = {
  avatar: [
    "avatar",
    "profile",
    "profile picture",
    "social media",
    "user",
    "account",
    "identity",
    "portrait",
    "headshot",
  ],
  character: [
    "character",
    "mascot",
    "persona",
    "figure",
    "3d character",
    "cartoon character",
  ],
  object: ["object", "icon", "ui icon", "3d icon", "illustration", "prop"],
  abstract: ["abstract", "decorative", "3d abstract", "design element", "shape"],
};

const STYLE_TAGS = ["3d", "3d illustration"];

const USE_CASE_TAGS: Record<IllustrationContentCategory, string[]> = {
  avatar: ["app", "website", "presentation"],
  character: ["branding", "marketing", "storytelling"],
  object: ["ui", "interface", "app design", "website"],
  abstract: ["background", "branding", "visual design"],
};

/** Append consistent category, style, and use-case tags without duplicating existing ones. */
export function enrichIllustrationTags(
  filename: string,
  tags: string[] | undefined
): string[] {
  const category = getIllustrationContentCategory(filename);
  const existing = new Set((tags ?? []).map((tag) => tag.toLowerCase()));
  const result = [...(tags ?? [])];

  const add = (tag: string) => {
    const key = tag.toLowerCase();
    if (existing.has(key)) {
      return;
    }

    existing.add(key);
    result.push(tag);
  };

  for (const tag of CATEGORY_TAGS[category]) {
    add(tag);
  }

  for (const tag of STYLE_TAGS) {
    add(tag);
  }

  for (const tag of USE_CASE_TAGS[category]) {
    add(tag);
  }

  add(category);

  return result;
}
