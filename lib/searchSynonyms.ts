/** Curated subject synonym groups — earlier terms rank higher when expanding a query. */
export const SEARCH_SYNONYM_GROUPS: readonly (readonly string[])[] = [
  ["dog", "puppy", "pet", "animal", "canine", "pup"],
  ["cat", "kitten", "pet", "animal", "feline", "kitty"],
  ["car", "automobile", "vehicle", "sedan", "suv", "transportation", "auto"],
  ["truck", "lorry", "vehicle", "transportation", "delivery"],
  ["bus", "coach", "transportation", "vehicle", "transit"],
  ["bike", "bicycle", "cycle", "cycling", "transportation"],
  ["plane", "airplane", "aircraft", "aviation", "flight"],
  ["train", "railway", "locomotive", "transportation", "transit"],
  ["boat", "ship", "vessel", "maritime", "sail"],
  ["house", "home", "building", "residence", "property", "real estate"],
  ["office", "workplace", "business", "corporate", "professional"],
  [
    "business",
    "office",
    "work",
    "professional",
    "corporate",
    "entrepreneur",
    "workplace",
  ],
  ["money", "finance", "banking", "payment", "cash", "currency"],
  ["food", "meal", "dining", "restaurant", "cuisine", "snack"],
  ["coffee", "espresso", "cafe", "beverage", "drink", "mug", "cup"],
  ["phone", "mobile", "smartphone", "cellphone", "cell", "device", "communication"],
  ["computer", "laptop", "pc", "desktop", "technology", "device"],
  ["search", "find", "discover", "explore", "magnifying glass", "lookup"],
  ["lock", "security", "secure", "padlock", "protection", "privacy"],
  ["user", "person", "people", "profile", "account", "member"],
  ["man", "male", "gentleman", "guy", "person"],
  ["woman", "female", "lady", "girl", "person"],
  ["boy", "child", "kid", "youth", "person"],
  ["girl", "child", "kid", "youth", "person"],
  ["doctor", "medical", "healthcare", "physician", "health", "medicine"],
  ["nurse", "medical", "healthcare", "health", "hospital"],
  ["teacher", "education", "school", "instructor", "learning"],
  ["student", "education", "school", "learning", "study"],
  ["police", "law", "security", "officer", "safety"],
  ["firefighter", "fire", "rescue", "emergency", "safety"],
  ["chef", "cook", "kitchen", "culinary", "food"],
  ["artist", "creative", "art", "design", "painter"],
  ["music", "musician", "audio", "song", "instrument"],
  ["sport", "sports", "athlete", "fitness", "exercise", "game"],
  ["book", "reading", "library", "education", "literature"],
  ["heart", "love", "romance", "affection", "like"],
  ["star", "favorite", "rating", "award", "achievement"],
  ["sun", "weather", "sunny", "day", "bright"],
  ["moon", "night", "lunar", "sleep", "evening"],
  ["cloud", "weather", "sky", "forecast", "online"],
  ["tree", "nature", "plant", "forest", "environment"],
  ["flower", "nature", "plant", "garden", "floral"],
  ["animal", "creature", "wildlife", "pet", "nature"],
  ["bear", "animal", "wildlife", "creature", "teddy"],
  ["bird", "animal", "wildlife", "avian", "nature"],
  ["fish", "animal", "seafood", "marine", "aquatic"],
  ["robot", "ai", "automation", "technology", "android"],
  ["alien", "space", "ufo", "sci-fi", "extraterrestrial"],
  ["rocket", "space", "launch", "astronomy", "ship"],
  ["gift", "present", "surprise", "celebration", "box"],
  ["calendar", "schedule", "date", "planner", "event"],
  ["email", "mail", "message", "inbox", "communication"],
  ["chat", "message", "conversation", "talk", "communication"],
  ["camera", "photo", "photography", "picture", "media"],
  ["video", "film", "movie", "media", "play"],
  ["settings", "preferences", "config", "gear", "options"],
  ["tool", "tools", "utility", "equipment", "repair"],
  ["shopping", "cart", "store", "retail", "ecommerce"],
  ["travel", "trip", "vacation", "journey", "tourism"],
  ["home", "house", "domestic", "household", "living"],
  ["key", "access", "unlock", "entry", "security"],
  ["time", "clock", "schedule", "hour", "watch"],
  ["idea", "lightbulb", "innovation", "creative", "brainstorm"],
  ["warning", "alert", "caution", "danger", "attention"],
  ["success", "check", "approve", "complete", "done"],
  ["error", "fail", "problem", "issue", "bug"],
  ["delete", "trash", "remove", "bin", "discard"],
  ["edit", "pencil", "write", "modify", "update"],
  ["download", "save", "export", "file", "cloud"],
  ["upload", "import", "share", "send", "cloud"],
  ["game", "gaming", "play", "controller", "entertainment"],
  ["medical", "health", "healthcare", "hospital", "wellness"],
  ["science", "lab", "research", "experiment", "chemistry"],
  ["math", "number", "numeral", "digit", "count"],
  ["avatar", "profile", "user", "headshot", "portrait", "social media"],
  ["cursor", "pointer", "mouse cursor", "mouse pointer", "arrow cursor", "pointer icon", "computer cursor", "selection cursor", "mouse", "click", "navigation", "select", "ui"],
  ["character", "mascot", "persona", "figure", "cartoon"],
  ["abstract", "decorative", "pattern", "shape", "design element"],
  ["3d", "3d icon", "3d illustration", "render", "isometric"],
  ["cute", "kawaii", "friendly", "playful", "adorable"],
  ["icon", "ui icon", "symbol", "glyph", "interface"],
];

const synonymRankByTerm = new Map<string, Map<string, number>>();

for (const group of SEARCH_SYNONYM_GROUPS) {
  const ranks = new Map<string, number>();
  group.forEach((term, index) => {
    ranks.set(normalizeSearchTerm(term), index);
  });

  for (const term of group) {
    synonymRankByTerm.set(normalizeSearchTerm(term), ranks);
  }
}

export function normalizeSearchTerm(value: string): string {
  return value.trim().toLowerCase();
}

export function tokenizeSearchQuery(query: string): string[] {
  return normalizeSearchTerm(query).split(/\s+/).filter(Boolean);
}

/** Expand one query token into ranked related terms (exact token first). */
export function expandSearchToken(token: string): Array<{
  term: string;
  rank: number;
}> {
  const normalized = normalizeSearchTerm(token);
  const ranks = synonymRankByTerm.get(normalized);

  if (ranks) {
    return [...ranks.entries()]
      .sort((a, b) => a[1] - b[1])
      .map(([term, rank]) => ({ term, rank }));
  }

  const expanded: Array<{ term: string; rank: number }> = [
    { term: normalized, rank: 0 },
  ];
  const seen = new Set<string>([normalized]);

  if (normalized.length >= 2) {
    for (const group of SEARCH_SYNONYM_GROUPS) {
      for (let index = 0; index < group.length; index += 1) {
        const candidate = normalizeSearchTerm(group[index]);
        if (
          candidate.length > normalized.length &&
          candidate.startsWith(normalized) &&
          normalized.length / candidate.length >= 0.4 &&
          !seen.has(candidate)
        ) {
          seen.add(candidate);
          expanded.push({ term: candidate, rank: index + 1 });
        }
      }
    }
  }

  return expanded;
}
